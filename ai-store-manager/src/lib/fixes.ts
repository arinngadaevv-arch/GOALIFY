import { eq } from "drizzle-orm";
import { db } from "@/db";
import { recommendations, shops } from "@/db/schema";
import {
  ShopifyAdminClient,
  updateCollection,
  updateProduct,
  updateProductMediaAlt,
} from "@/lib/shopify/admin";
import {
  generateCollectionDescription,
  generateImageAltTexts,
  generateProductDescription,
  generateProductSeo,
  generateProductTitle,
  type ProductContext,
} from "@/lib/ai";

type Recommendation = typeof recommendations.$inferSelect;
type Shop = typeof shops.$inferSelect;

const PRODUCT_CONTEXT_QUERY = /* GraphQL */ `
  query FixProductContext($id: ID!) {
    product(id: $id) {
      id
      title
      description
      vendor
      productType
      priceRangeV2 {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      media(first: 20) {
        nodes {
          ... on MediaImage {
            id
            alt
          }
        }
      }
    }
  }
`;

interface ProductContextResult {
  product: {
    id: string;
    title: string;
    description: string;
    vendor: string;
    productType: string;
    priceRangeV2: { minVariantPrice: { amount: string; currencyCode: string } };
    media: { nodes: ({ id: string; alt: string | null } | Record<string, never>)[] };
  } | null;
}

async function fetchProductContext(
  client: ShopifyAdminClient,
  productId: string
): Promise<{ context: ProductContext; media: { id: string; alt: string | null }[] }> {
  const data = await client.query<ProductContextResult>(PRODUCT_CONTEXT_QUERY, { id: productId });
  if (!data.product) {
    throw new Error("Product no longer exists in the store");
  }
  const price = data.product.priceRangeV2.minVariantPrice;
  return {
    context: {
      title: data.product.title,
      description: data.product.description,
      vendor: data.product.vendor,
      productType: data.product.productType,
      price: `${price.amount} ${price.currencyCode}`,
    },
    media: data.product.media.nodes.filter(
      (m): m is { id: string; alt: string | null } => "id" in m
    ),
  };
}

const COLLECTION_PRODUCTS_QUERY = /* GraphQL */ `
  query FixCollectionContext($id: ID!) {
    collection(id: $id) {
      id
      title
      products(first: 8) {
        nodes {
          title
        }
      }
    }
  }
`;

interface CollectionContextResult {
  collection: {
    id: string;
    title: string;
    products: { nodes: { title: string }[] };
  } | null;
}

export interface FixResult {
  summary: string;
  detail?: Record<string, unknown>;
}

// Executes an automated fix. Throws with a human-readable message on failure;
// the API route records it on the recommendation row.
export async function applyFix(shop: Shop, recommendation: Recommendation): Promise<FixResult> {
  const fix = recommendation.proposedChange;
  if (!fix || fix.kind !== "automated") {
    throw new Error("This recommendation requires a manual fix in Shopify admin");
  }

  const client = new ShopifyAdminClient(shop.domain, shop.accessToken);
  const params = fix.params ?? {};
  const productId = typeof params.productId === "string" ? params.productId : null;

  switch (fix.action) {
    case "rewrite_product_title": {
      if (!productId) throw new Error("Fix payload is missing the product reference");
      const { context } = await fetchProductContext(client, productId);
      const title = await generateProductTitle(context);
      await updateProduct(client, { id: productId, title });
      return { summary: `Title updated to "${title}"`, detail: { title } };
    }

    case "rewrite_product_description": {
      if (!productId) throw new Error("Fix payload is missing the product reference");
      const { context } = await fetchProductContext(client, productId);
      const html = await generateProductDescription(context);
      await updateProduct(client, { id: productId, descriptionHtml: html });
      return { summary: "Description rewritten and published", detail: { html } };
    }

    case "generate_product_seo": {
      if (!productId) throw new Error("Fix payload is missing the product reference");
      const { context } = await fetchProductContext(client, productId);
      const seo = await generateProductSeo(context);
      await updateProduct(client, {
        id: productId,
        seo: { title: seo.seoTitle, description: seo.seoDescription },
      });
      return { summary: "SEO title and meta description published", detail: seo };
    }

    case "generate_image_alt_text": {
      if (!productId) throw new Error("Fix payload is missing the product reference");
      const { context, media } = await fetchProductContext(client, productId);
      const currentIds = media.map((m) => m.id);
      // Prefer the images flagged at scan time; if they've been replaced since,
      // fall back to whatever is missing ALT text right now.
      let targetIds = Array.isArray(params.mediaIds)
        ? (params.mediaIds as string[]).filter((id) => currentIds.includes(id))
        : [];
      if (targetIds.length === 0) {
        targetIds = media.filter((m) => !m.alt || m.alt.trim() === "").map((m) => m.id);
      }
      if (targetIds.length === 0) {
        return { summary: "Images already have ALT text — nothing to change" };
      }
      const altTexts = await generateImageAltTexts(context, targetIds.length);
      await updateProductMediaAlt(
        client,
        productId,
        targetIds.map((id, i) => ({ id, alt: altTexts[i] ?? altTexts[0] }))
      );
      return {
        summary: `ALT text added to ${targetIds.length} image${targetIds.length > 1 ? "s" : ""}`,
        detail: { altTexts },
      };
    }

    case "generate_collection_description": {
      const collectionId = typeof params.collectionId === "string" ? params.collectionId : null;
      if (!collectionId) throw new Error("Fix payload is missing the collection reference");
      const data = await client.query<CollectionContextResult>(COLLECTION_PRODUCTS_QUERY, {
        id: collectionId,
      });
      if (!data.collection) throw new Error("Collection no longer exists in the store");
      const html = await generateCollectionDescription(
        data.collection.title,
        data.collection.products.nodes.map((p) => p.title)
      );
      await updateCollection(client, { id: collectionId, descriptionHtml: html });
      return { summary: `Description published for "${data.collection.title}"`, detail: { html } };
    }

    default:
      throw new Error(`Unknown fix action: ${fix.action}`);
  }
}

export async function markApplied(
  recommendationId: string,
  result: FixResult
): Promise<void> {
  await db
    .update(recommendations)
    .set({
      status: "applied",
      appliedAt: new Date(),
      appliedResult: result,
      error: null,
      updatedAt: new Date(),
    })
    .where(eq(recommendations.id, recommendationId));
}

export async function markFailed(recommendationId: string, message: string): Promise<void> {
  await db
    .update(recommendations)
    .set({ status: "failed", error: message, updatedAt: new Date() })
    .where(eq(recommendations.id, recommendationId));
}
