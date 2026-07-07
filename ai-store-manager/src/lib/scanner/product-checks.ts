import type { ScannedProduct } from "@/lib/shopify/admin";
import type { Finding } from "./types";

function productFinding(
  product: ScannedProduct,
  finding: Omit<Finding, "shopifyProductId" | "productTitle">
): Finding {
  return { ...finding, shopifyProductId: product.id, productTitle: product.title };
}

export function checkProduct(product: ScannedProduct): Finding[] {
  const findings: Finding[] = [];
  const title = product.title.trim();
  const description = product.description.trim();

  // --- Title quality ---
  if (title.length < 20) {
    findings.push(
      productFinding(product, {
        category: "seo",
        severity: "medium",
        title: `Product title is too short: "${title}"`,
        explanation: `The title is only ${title.length} characters. Short titles carry almost no keywords and give shoppers little idea of what the product is.`,
        whyItMatters:
          "Titles are the strongest on-page SEO signal and the first thing shoppers read in search results and collection grids. Vague titles lose both rankings and clicks.",
        expectedImpact: "More search impressions and a higher click-through rate on this product.",
        aiRecommendation:
          "Rewrite the title to 30-60 characters that lead with what the product is, followed by its key differentiator (material, use case, or style).",
        fix: {
          kind: "automated",
          action: "rewrite_product_title",
          params: { productId: product.id },
        },
      })
    );
  } else if (title.length > 70) {
    findings.push(
      productFinding(product, {
        category: "seo",
        severity: "low",
        title: `Product title is too long (${title.length} characters)`,
        explanation: `Google truncates titles around 60-70 characters, so the end of this title is cut off in search results.`,
        whyItMatters:
          "A truncated title can cut off the most persuasive part mid-sentence, making the search snippet look broken and less clickable.",
        expectedImpact: "Cleaner search snippets and a modest click-through improvement.",
        aiRecommendation:
          "Shorten the title to under 60 characters, keeping the product name and one differentiator; move secondary details into the description.",
        fix: {
          kind: "automated",
          action: "rewrite_product_title",
          params: { productId: product.id },
        },
      })
    );
  }

  if (title.length > 3 && (title === title.toUpperCase() || title === title.toLowerCase())) {
    findings.push(
      productFinding(product, {
        category: "design",
        severity: "low",
        title: "Product title casing looks unpolished",
        explanation: `The title is written in ${title === title.toUpperCase() ? "ALL CAPS" : "all lowercase"}, which reads as unedited or spammy next to properly cased titles.`,
        whyItMatters:
          "Typography consistency is a trust signal. Shoppers subconsciously associate sloppy formatting with unreliable stores.",
        expectedImpact: "A more professional product grid and stronger perceived brand quality.",
        aiRecommendation: "Convert the title to Title Case while keeping brand names as intended.",
        fix: {
          kind: "automated",
          action: "rewrite_product_title",
          params: { productId: product.id },
        },
      })
    );
  }

  // --- Description quality ---
  if (description.length === 0) {
    findings.push(
      productFinding(product, {
        category: "conversion",
        severity: "critical",
        title: "Product has no description",
        explanation:
          "The product page shows only a title, price and images. There is nothing answering what it is, who it's for, or why to buy it.",
        whyItMatters:
          "Shoppers who can't answer their questions leave. Products without descriptions also rank for almost nothing in search because there is no indexable content.",
        expectedImpact: "This is typically one of the highest-converting fixes available — descriptions routinely lift product conversion by double digits.",
        aiRecommendation:
          "Generate a structured description: a one-line hook, 3-5 benefit bullets, materials/specs, and shipping expectations.",
        fix: {
          kind: "automated",
          action: "rewrite_product_description",
          params: { productId: product.id },
        },
      })
    );
  } else if (description.length < 200) {
    findings.push(
      productFinding(product, {
        category: "conversion",
        severity: "high",
        title: `Product description is thin (${description.length} characters)`,
        explanation:
          "The description is a sentence or two — not enough to answer sizing, materials, use cases, or objections a shopper has before buying.",
        whyItMatters:
          "Thin content converts poorly and is treated as low-quality by search engines, hurting both conversion and organic traffic at the same time.",
        expectedImpact: "Higher add-to-cart rate and better organic rankings for this product.",
        aiRecommendation:
          "Expand into a full description: benefit-led opening, bullet list of features, specifications, and answers to the most likely pre-purchase questions.",
        fix: {
          kind: "automated",
          action: "rewrite_product_description",
          params: { productId: product.id },
        },
      })
    );
  } else if (
    description.length > 600 &&
    !/<(p|ul|ol|h[1-6]|br)\b/i.test(product.descriptionHtml)
  ) {
    findings.push(
      productFinding(product, {
        category: "copywriting",
        severity: "medium",
        title: "Description is an unformatted wall of text",
        explanation:
          "The description is long but has no paragraphs, headings, or bullet points — it renders as one dense block.",
        whyItMatters:
          "Most shoppers scan rather than read. A wall of text gets skipped entirely, which means its selling points never land — especially on mobile.",
        expectedImpact: "More shoppers actually absorb the selling points, improving add-to-cart rate.",
        aiRecommendation:
          "Restructure the same content into scannable sections: short opening paragraph, benefit bullets, and a specs block.",
        fix: {
          kind: "automated",
          action: "rewrite_product_description",
          params: { productId: product.id },
        },
      })
    );
  }

  // --- Images ---
  if (product.images.length === 0) {
    findings.push(
      productFinding(product, {
        category: "conversion",
        severity: "critical",
        title: "Product has no images",
        explanation: "The product page and every collection grid slot for this product show a placeholder instead of the product.",
        whyItMatters:
          "Online shoppers buy with their eyes; a product they cannot see is effectively unsellable, and the placeholder makes the whole store look unfinished.",
        expectedImpact: "Restoring images is the difference between near-zero and normal conversion for this product.",
        aiRecommendation:
          "Upload at least 3 images: a clean primary shot on neutral background, a lifestyle/in-use shot, and a detail close-up.",
        fix: {
          kind: "manual",
          action: "add_product_images",
          params: { productId: product.id },
        },
      })
    );
  } else if (product.images.length === 1) {
    findings.push(
      productFinding(product, {
        category: "conversion",
        severity: "medium",
        title: "Product has only one image",
        explanation: "Shoppers can't see the product from other angles, in context, or in detail before deciding.",
        whyItMatters:
          "Multiple images substitute for picking the product up in a store. Single-image products see more hesitation, fewer purchases, and more returns.",
        expectedImpact: "Additional angles typically lift conversion and reduce return rates.",
        aiRecommendation:
          "Add 2-4 more images: alternate angles, scale reference, and the product in use.",
        fix: {
          kind: "manual",
          action: "add_product_images",
          params: { productId: product.id },
        },
      })
    );
  }

  const missingAlt = product.images.filter((img) => !img.alt || img.alt.trim() === "");
  if (missingAlt.length > 0) {
    findings.push(
      productFinding(product, {
        category: "accessibility",
        severity: "high",
        title: `${missingAlt.length} product image${missingAlt.length > 1 ? "s are" : " is"} missing ALT text`,
        explanation:
          "Screen readers announce these images as unnamed graphics, and search engines can't understand what they show.",
        whyItMatters:
          "ALT text is both an accessibility requirement and how products get into Google Images — a meaningful discovery channel for visual products.",
        expectedImpact: "Better accessibility compliance and additional traffic from image search.",
        aiRecommendation:
          "Generate descriptive ALT text for each image based on the product title and type.",
        fix: {
          kind: "automated",
          action: "generate_image_alt_text",
          params: { productId: product.id, mediaIds: missingAlt.map((img) => img.id) },
        },
      })
    );
  }

  // --- SEO metadata ---
  if (!product.seoDescription || product.seoDescription.trim() === "") {
    findings.push(
      productFinding(product, {
        category: "seo",
        severity: "medium",
        title: "Missing SEO meta description",
        explanation:
          "Without a meta description, Google assembles a snippet from arbitrary page text, which is rarely persuasive.",
        whyItMatters:
          "The meta description is your ad copy in search results. A written one consistently outperforms an auto-generated fragment on click-through.",
        expectedImpact: "Higher click-through rate from existing search impressions — free traffic without new rankings.",
        aiRecommendation:
          "Generate a 140-155 character meta description that states what the product is and gives one concrete reason to click.",
        fix: {
          kind: "automated",
          action: "generate_product_seo",
          params: { productId: product.id },
        },
      })
    );
  } else if (product.seoDescription.length > 165) {
    findings.push(
      productFinding(product, {
        category: "seo",
        severity: "low",
        title: `SEO meta description is too long (${product.seoDescription.length} characters)`,
        explanation: "Google truncates descriptions around 155-160 characters, so this one ends in an ellipsis.",
        whyItMatters: "A cut-off pitch reads as careless and buries whatever call-to-action was at the end.",
        expectedImpact: "A cleaner, complete search snippet.",
        aiRecommendation: "Rewrite the meta description to 140-155 characters with the hook up front.",
        fix: {
          kind: "automated",
          action: "generate_product_seo",
          params: { productId: product.id },
        },
      })
    );
  }

  // --- Variants ---
  if (product.variantCount > 50) {
    findings.push(
      productFinding(product, {
        category: "conversion",
        severity: "low",
        title: `Product has ${product.variantCount} variants`,
        explanation: "An overwhelming variant matrix makes the buying decision harder rather than easier.",
        whyItMatters:
          "Choice overload is one of the best-documented conversion killers: past a point, each extra option adds hesitation, not sales.",
        expectedImpact: "A simpler purchase decision and less drop-off on the product page.",
        aiRecommendation:
          "Split this product into several focused products (e.g. by style), or trim rarely-purchased variants.",
        fix: {
          kind: "manual",
          action: "restructure_variants",
          params: { productId: product.id },
        },
      })
    );
  }

  // --- Pricing sanity ---
  if (parseFloat(product.minPrice) === 0 && product.status === "ACTIVE") {
    findings.push(
      productFinding(product, {
        category: "pricing",
        severity: "high",
        title: "Active product is priced at 0",
        explanation: "At least one variant of this live product has a price of zero.",
        whyItMatters:
          "A $0 price is either a costly data-entry mistake or reads as a scam signal to shoppers — both outcomes lose money or trust.",
        expectedImpact: "Prevents free checkouts and removes a glaring trust red flag.",
        aiRecommendation:
          "Set the correct price, or unpublish the product until pricing is finalized. Prices are never changed automatically — this always needs your confirmation.",
        fix: {
          kind: "manual",
          action: "fix_zero_price",
          params: { productId: product.id },
        },
      })
    );
  }

  // --- Organization ---
  if (!product.productType || product.productType.trim() === "") {
    findings.push(
      productFinding(product, {
        category: "seo",
        severity: "low",
        title: "Product has no product type set",
        explanation:
          "The product type field is empty, so this product is invisible to type-based collections, filters, and feeds.",
        whyItMatters:
          "Product type powers automated collections, storefront filtering, and Google Shopping categorization — leaving it blank quietly degrades all three.",
        expectedImpact: "Better store navigation and cleaner shopping-feed data.",
        aiRecommendation: "Set a concise product type (e.g. \"T-Shirt\", \"Desk Lamp\") in Shopify admin.",
        fix: {
          kind: "manual",
          action: "set_product_type",
          params: { productId: product.id },
        },
      })
    );
  }

  return findings;
}

// Cross-product checks: duplicates and branding consistency.
export function checkProductSet(products: ScannedProduct[]): Finding[] {
  const findings: Finding[] = [];
  if (products.length === 0) return findings;

  // Duplicate titles
  const byTitle = new Map<string, ScannedProduct[]>();
  for (const p of products) {
    const key = p.title.trim().toLowerCase();
    byTitle.set(key, [...(byTitle.get(key) ?? []), p]);
  }
  for (const [, group] of byTitle) {
    if (group.length > 1) {
      findings.push({
        category: "seo",
        severity: "medium",
        title: `${group.length} products share the title "${group[0].title}"`,
        explanation: "Multiple products have identical titles, so they compete with each other in search and confuse shoppers comparing them.",
        whyItMatters:
          "Duplicate titles split ranking signals between pages and make it impossible for shoppers (and Google) to tell the products apart.",
        expectedImpact: "Each product can rank and convert on its own merits instead of cannibalizing the others.",
        aiRecommendation:
          "Differentiate each title with its distinguishing attribute (color, size class, edition).",
        fix: {
          kind: "manual",
          action: "differentiate_titles",
          params: { productIds: group.map((p) => p.id) },
        },
        shopifyProductId: group[0].id,
        productTitle: group[0].title,
      });
    }
  }

  // Duplicate SEO descriptions
  const bySeoDesc = new Map<string, ScannedProduct[]>();
  for (const p of products) {
    const desc = p.seoDescription?.trim();
    if (!desc) continue;
    bySeoDesc.set(desc, [...(bySeoDesc.get(desc) ?? []), p]);
  }
  for (const [, group] of bySeoDesc) {
    if (group.length > 1) {
      findings.push({
        category: "seo",
        severity: "medium",
        title: `${group.length} products share the same SEO meta description`,
        explanation: `"${group[0].title}" and ${group.length - 1} other product(s) use an identical meta description.`,
        whyItMatters:
          "Duplicate meta descriptions are a classic thin-content signal and waste the chance to pitch each product on its own strengths in search results.",
        expectedImpact: "Distinct snippets improve click-through across all affected products.",
        aiRecommendation: "Generate a unique meta description per product.",
        fix: {
          kind: "automated",
          action: "generate_product_seo",
          params: { productId: group[0].id },
        },
        shopifyProductId: group[0].id,
        productTitle: group[0].title,
      });
    }
  }

  // Branding consistency: mixed title casing conventions across the catalog
  const titled = products.filter((p) => p.title.trim().length > 3);
  const allCaps = titled.filter((p) => p.title === p.title.toUpperCase()).length;
  const capsRatio = titled.length > 0 ? allCaps / titled.length : 0;
  if (capsRatio > 0.1 && capsRatio < 0.9) {
    findings.push({
      category: "design",
      severity: "low",
      title: "Inconsistent title formatting across the catalog",
      explanation: `${allCaps} of ${titled.length} product titles are ALL CAPS while the rest are not — the catalog mixes formatting conventions.`,
      whyItMatters:
        "A collection grid with mixed casing looks like it was stocked by different people with no brand standards, which erodes the premium feel of the store.",
      expectedImpact: "A visually consistent catalog that reads as one deliberate brand.",
      aiRecommendation: "Pick one convention (Title Case is the safest) and apply it to every product.",
      fix: {
        kind: "manual",
        action: "normalize_title_casing",
      },
    });
  }

  return findings;
}
