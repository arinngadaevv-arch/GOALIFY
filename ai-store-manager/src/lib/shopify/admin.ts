import { shopifyConfig } from "./config";

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

export class ShopifyAdminClient {
  constructor(
    private readonly shopDomain: string,
    private readonly accessToken: string
  ) {}

  async query<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const response = await fetch(
      `https://${this.shopDomain}/admin/api/${shopifyConfig.apiVersion}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": this.accessToken,
        },
        body: JSON.stringify({ query, variables }),
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify GraphQL request failed: ${response.status}`);
    }

    const body: GraphQLResponse<T> = await response.json();
    if (body.errors?.length) {
      throw new Error(`Shopify GraphQL error: ${body.errors.map((e) => e.message).join("; ")}`);
    }
    if (!body.data) {
      throw new Error("Shopify GraphQL returned no data");
    }
    return body.data;
  }

  // Runs a query but returns null instead of throwing, so the scanner can
  // degrade gracefully when the app lacks a scope or the API shape changes.
  async safeQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T | null> {
    try {
      return await this.query<T>(query, variables);
    } catch {
      return null;
    }
  }
}

// ---------- Typed fetchers used by the scanner ----------

export interface ScannedProductImage {
  id: string;
  alt: string | null;
}

export interface ScannedProduct {
  id: string; // gid://shopify/Product/...
  title: string;
  handle: string;
  status: string;
  description: string; // plain text
  descriptionHtml: string;
  vendor: string;
  productType: string;
  onlineStoreUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  images: ScannedProductImage[];
  variantCount: number;
  minPrice: string;
}

const PRODUCTS_QUERY = /* GraphQL */ `
  query ScanProducts($cursor: String) {
    products(first: 50, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        title
        handle
        status
        description
        descriptionHtml
        vendor
        productType
        onlineStoreUrl
        seo {
          title
          description
        }
        media(first: 20) {
          nodes {
            ... on MediaImage {
              id
              alt
            }
          }
        }
        variantsCount {
          count
        }
        priceRangeV2 {
          minVariantPrice {
            amount
          }
        }
      }
    }
  }
`;

interface ProductsQueryResult {
  products: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: {
      id: string;
      title: string;
      handle: string;
      status: string;
      description: string;
      descriptionHtml: string;
      vendor: string;
      productType: string;
      onlineStoreUrl: string | null;
      seo: { title: string | null; description: string | null };
      media: { nodes: ({ id: string; alt: string | null } | Record<string, never>)[] };
      variantsCount: { count: number } | null;
      priceRangeV2: { minVariantPrice: { amount: string } };
    }[];
  };
}

const MAX_PRODUCT_PAGES = 4; // cap a scan at 200 products for now

export async function fetchProducts(client: ShopifyAdminClient): Promise<ScannedProduct[]> {
  const products: ScannedProduct[] = [];
  let cursor: string | null = null;

  for (let page = 0; page < MAX_PRODUCT_PAGES; page++) {
    const data: ProductsQueryResult = await client.query<ProductsQueryResult>(PRODUCTS_QUERY, {
      cursor,
    });

    for (const node of data.products.nodes) {
      products.push({
        id: node.id,
        title: node.title,
        handle: node.handle,
        status: node.status,
        description: node.description,
        descriptionHtml: node.descriptionHtml,
        vendor: node.vendor,
        productType: node.productType,
        onlineStoreUrl: node.onlineStoreUrl,
        seoTitle: node.seo?.title ?? null,
        seoDescription: node.seo?.description ?? null,
        images: node.media.nodes
          .filter((m): m is { id: string; alt: string | null } => "id" in m)
          .map((m) => ({ id: m.id, alt: m.alt })),
        variantCount: node.variantsCount?.count ?? 0,
        minPrice: node.priceRangeV2.minVariantPrice.amount,
      });
    }

    if (!data.products.pageInfo.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
  }

  return products;
}

export interface ScannedCollection {
  id: string;
  title: string;
  handle: string;
  description: string;
  hasImage: boolean;
  productsCount: number;
  seoDescription: string | null;
}

const COLLECTIONS_QUERY = /* GraphQL */ `
  query ScanCollections {
    collections(first: 50) {
      nodes {
        id
        title
        handle
        description
        image {
          url
        }
        productsCount {
          count
        }
        seo {
          description
        }
      }
    }
  }
`;

interface CollectionsQueryResult {
  collections: {
    nodes: {
      id: string;
      title: string;
      handle: string;
      description: string;
      image: { url: string } | null;
      productsCount: { count: number } | null;
      seo: { description: string | null };
    }[];
  };
}

export async function fetchCollections(
  client: ShopifyAdminClient
): Promise<ScannedCollection[] | null> {
  const data = await client.safeQuery<CollectionsQueryResult>(COLLECTIONS_QUERY);
  if (!data) return null;
  return data.collections.nodes.map((node) => ({
    id: node.id,
    title: node.title,
    handle: node.handle,
    description: node.description,
    hasImage: node.image !== null,
    productsCount: node.productsCount?.count ?? 0,
    seoDescription: node.seo?.description ?? null,
  }));
}

export interface ScannedPolicies {
  types: string[]; // e.g. ["REFUND_POLICY", "PRIVACY_POLICY"]
}

const POLICIES_QUERY = /* GraphQL */ `
  query ScanPolicies {
    shop {
      shopPolicies {
        type
        body
      }
    }
  }
`;

interface PoliciesQueryResult {
  shop: { shopPolicies: { type: string; body: string }[] };
}

export async function fetchPolicies(client: ShopifyAdminClient): Promise<ScannedPolicies | null> {
  const data = await client.safeQuery<PoliciesQueryResult>(POLICIES_QUERY);
  if (!data) return null;
  return {
    types: data.shop.shopPolicies.filter((p) => p.body.trim().length > 0).map((p) => p.type),
  };
}

export interface ScannedMenu {
  handle: string;
  title: string;
  itemCount: number;
}

const MENUS_QUERY = /* GraphQL */ `
  query ScanMenus {
    menus(first: 10) {
      nodes {
        handle
        title
        items {
          title
        }
      }
    }
  }
`;

interface MenusQueryResult {
  menus: { nodes: { handle: string; title: string; items: { title: string }[] }[] };
}

export async function fetchMenus(client: ShopifyAdminClient): Promise<ScannedMenu[] | null> {
  const data = await client.safeQuery<MenusQueryResult>(MENUS_QUERY);
  if (!data) return null;
  return data.menus.nodes.map((m) => ({
    handle: m.handle,
    title: m.title,
    itemCount: m.items.length,
  }));
}

export interface ScannedPage {
  title: string;
  handle: string;
  bodyLength: number;
}

const PAGES_QUERY = /* GraphQL */ `
  query ScanPages {
    pages(first: 50) {
      nodes {
        title
        handle
        body
      }
    }
  }
`;

interface PagesQueryResult {
  pages: { nodes: { title: string; handle: string; body: string }[] };
}

export async function fetchPages(client: ShopifyAdminClient): Promise<ScannedPage[] | null> {
  const data = await client.safeQuery<PagesQueryResult>(PAGES_QUERY);
  if (!data) return null;
  return data.pages.nodes.map((p) => ({
    title: p.title,
    handle: p.handle,
    bodyLength: p.body?.length ?? 0,
  }));
}

export interface ScannedHomepage {
  ok: boolean;
  title: string | null;
  metaDescription: string | null;
  hasH1: boolean;
  ogImage: boolean;
  imagesMissingAlt: number;
  totalImages: number;
  htmlBytes: number;
  scriptCount: number;
}

// Fetches the public storefront homepage and extracts SEO/accessibility/
// performance signals from the raw HTML. No headless browser needed for v1.
export async function fetchHomepage(shopDomain: string): Promise<ScannedHomepage | null> {
  try {
    const response = await fetch(`https://${shopDomain}/`, {
      headers: { "User-Agent": "AIStoreManager/1.0 (+store health scanner)" },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return null;
    const html = await response.text();

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const metaDescMatch = html.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i
    ) ?? html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);

    const imgTags = html.match(/<img\b[^>]*>/gi) ?? [];
    const imagesMissingAlt = imgTags.filter((tag) => !/\balt\s*=\s*["'][^"']+["']/i.test(tag))
      .length;

    return {
      ok: true,
      title: titleMatch ? titleMatch[1].trim() : null,
      metaDescription: metaDescMatch ? metaDescMatch[1].trim() : null,
      hasH1: /<h1[\s>]/i.test(html),
      ogImage: /<meta[^>]+property=["']og:image["']/i.test(html),
      imagesMissingAlt,
      totalImages: imgTags.length,
      htmlBytes: Buffer.byteLength(html, "utf8"),
      scriptCount: (html.match(/<script\b/gi) ?? []).length,
    };
  } catch {
    return null;
  }
}

// ---------- Mutations used by the fix engine ----------

const PRODUCT_UPDATE_MUTATION = /* GraphQL */ `
  mutation FixProductUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

interface ProductUpdateResult {
  productUpdate: {
    product: { id: string } | null;
    userErrors: { field: string[] | null; message: string }[];
  };
}

export async function updateProduct(
  client: ShopifyAdminClient,
  input: {
    id: string;
    title?: string;
    descriptionHtml?: string;
    seo?: { title?: string; description?: string };
  }
): Promise<void> {
  const data = await client.query<ProductUpdateResult>(PRODUCT_UPDATE_MUTATION, { input });
  const errors = data.productUpdate.userErrors;
  if (errors.length > 0) {
    throw new Error(`Shopify rejected the product update: ${errors.map((e) => e.message).join("; ")}`);
  }
}

const MEDIA_UPDATE_MUTATION = /* GraphQL */ `
  mutation FixMediaAlt($productId: ID!, $media: [UpdateMediaInput!]!) {
    productUpdateMedia(productId: $productId, media: $media) {
      media {
        id
      }
      mediaUserErrors {
        message
      }
    }
  }
`;

interface MediaUpdateResult {
  productUpdateMedia: {
    media: { id: string }[] | null;
    mediaUserErrors: { message: string }[];
  };
}

export async function updateProductMediaAlt(
  client: ShopifyAdminClient,
  productId: string,
  media: { id: string; alt: string }[]
): Promise<void> {
  const data = await client.query<MediaUpdateResult>(MEDIA_UPDATE_MUTATION, { productId, media });
  const errors = data.productUpdateMedia.mediaUserErrors;
  if (errors.length > 0) {
    throw new Error(`Shopify rejected the alt text update: ${errors.map((e) => e.message).join("; ")}`);
  }
}

const COLLECTION_UPDATE_MUTATION = /* GraphQL */ `
  mutation FixCollectionUpdate($input: CollectionInput!) {
    collectionUpdate(input: $input) {
      collection {
        id
      }
      userErrors {
        message
      }
    }
  }
`;

interface CollectionUpdateResult {
  collectionUpdate: {
    collection: { id: string } | null;
    userErrors: { message: string }[];
  };
}

export async function updateCollection(
  client: ShopifyAdminClient,
  input: { id: string; descriptionHtml?: string }
): Promise<void> {
  const data = await client.query<CollectionUpdateResult>(COLLECTION_UPDATE_MUTATION, { input });
  const errors = data.collectionUpdate.userErrors;
  if (errors.length > 0) {
    throw new Error(
      `Shopify rejected the collection update: ${errors.map((e) => e.message).join("; ")}`
    );
  }
}
