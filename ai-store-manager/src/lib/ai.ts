import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.AI_MODEL ?? "claude-opus-4-8";

let client: Anthropic | null = null;

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function getClient(): Anthropic {
  if (!isAiConfigured()) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set — AI content generation is required for this fix"
    );
  }
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

// Generates content constrained to a JSON schema so fix handlers get exactly
// the fields they need to write back to Shopify.
async function generateJson<T>(
  prompt: string,
  schema: Record<string, unknown>
): Promise<T> {
  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 2048,
    system:
      "You are the copywriting engine of an AI store manager for Shopify merchants. " +
      "Write in the merchant's existing tone where evident, be specific rather than generic, " +
      "and never invent product facts (materials, dimensions, certifications) that were not provided.",
    messages: [{ role: "user", content: prompt }],
    output_config: {
      format: { type: "json_schema", schema },
    },
  });

  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") {
    throw new Error("AI returned no content");
  }
  return JSON.parse(text.text) as T;
}

export interface ProductContext {
  title: string;
  description: string;
  vendor: string;
  productType: string;
  price: string;
}

function productContextBlock(p: ProductContext): string {
  return [
    `Title: ${p.title}`,
    `Current description: ${p.description || "(none)"}`,
    p.vendor ? `Vendor: ${p.vendor}` : null,
    p.productType ? `Product type: ${p.productType}` : null,
    `Price: ${p.price}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function generateProductTitle(product: ProductContext): Promise<string> {
  const result = await generateJson<{ title: string }>(
    `Rewrite this Shopify product's title. Requirements: 30-60 characters, Title Case, ` +
      `lead with what the product is, include one differentiator drawn from the existing ` +
      `content, no promotional fluff like "Best" or "Amazing".\n\n${productContextBlock(product)}`,
    {
      type: "object",
      properties: { title: { type: "string" } },
      required: ["title"],
      additionalProperties: false,
    }
  );
  return result.title;
}

export async function generateProductDescription(product: ProductContext): Promise<string> {
  const result = await generateJson<{ html: string }>(
    `Write a Shopify product description as clean HTML (only <p>, <ul>, <li>, <h3>, <strong> tags). ` +
      `Structure: one-sentence hook paragraph, then 3-5 benefit bullets, then a short details ` +
      `paragraph. 120-220 words. Ground every claim in the provided content — do not invent ` +
      `materials, dimensions, or certifications.\n\n${productContextBlock(product)}`,
    {
      type: "object",
      properties: { html: { type: "string" } },
      required: ["html"],
      additionalProperties: false,
    }
  );
  return result.html;
}

export async function generateProductSeo(
  product: ProductContext
): Promise<{ seoTitle: string; seoDescription: string }> {
  return generateJson<{ seoTitle: string; seoDescription: string }>(
    `Write SEO metadata for this Shopify product. seoTitle: max 60 characters, front-load ` +
      `the main keyword. seoDescription: 140-155 characters, state what it is plus one ` +
      `concrete reason to click.\n\n${productContextBlock(product)}`,
    {
      type: "object",
      properties: {
        seoTitle: { type: "string" },
        seoDescription: { type: "string" },
      },
      required: ["seoTitle", "seoDescription"],
      additionalProperties: false,
    }
  );
}

export async function generateImageAltTexts(
  product: ProductContext,
  imageCount: number
): Promise<string[]> {
  const result = await generateJson<{ altTexts: string[] }>(
    `Write ${imageCount} distinct ALT text strings for this product's images. Each: max 100 ` +
      `characters, descriptive of the product (assume standard e-commerce shots: primary view, ` +
      `alternate angle, detail, lifestyle), no "image of"/"photo of" prefixes.\n\n` +
      productContextBlock(product),
    {
      type: "object",
      properties: {
        altTexts: { type: "array", items: { type: "string" } },
      },
      required: ["altTexts"],
      additionalProperties: false,
    }
  );
  return result.altTexts;
}

export async function generateCollectionDescription(
  collectionTitle: string,
  productTitles: string[]
): Promise<string> {
  const result = await generateJson<{ html: string }>(
    `Write a Shopify collection description as HTML (only <p> tags, 2-3 sentences, 40-80 words). ` +
      `Name the category, who it's for, and what makes the selection worth browsing. ` +
      `No promotional filler.\n\nCollection: ${collectionTitle}\n` +
      `Example products in it: ${productTitles.slice(0, 8).join(", ") || "(unknown)"}`,
    {
      type: "object",
      properties: { html: { type: "string" } },
      required: ["html"],
      additionalProperties: false,
    }
  );
  return result.html;
}
