import type {
  ScannedCollection,
  ScannedHomepage,
  ScannedMenu,
  ScannedPage,
  ScannedPolicies,
} from "@/lib/shopify/admin";
import type { Finding } from "./types";

export function checkCollections(collections: ScannedCollection[]): Finding[] {
  const findings: Finding[] = [];

  for (const collection of collections) {
    if (collection.productsCount === 0) {
      findings.push({
        category: "conversion",
        severity: "high",
        title: `Collection "${collection.title}" is empty`,
        explanation: "This collection is live but contains zero products — visitors who open it hit a dead end.",
        whyItMatters:
          "An empty collection page is one of the fastest ways to lose a browsing shopper; it reads as an abandoned store.",
        expectedImpact: "Removes a dead end from the browsing flow and keeps shoppers moving toward products.",
        aiRecommendation: `Add products to "${collection.title}" or unpublish it until it has inventory.`,
        fix: { kind: "manual", action: "fill_or_hide_collection", params: { collectionId: collection.id } },
      });
      continue; // description/image findings are noise for an empty collection
    }

    if (collection.description.trim().length === 0) {
      findings.push({
        category: "seo",
        severity: "medium",
        title: `Collection "${collection.title}" has no description`,
        explanation: "The collection page has no introductory copy, so it offers search engines nothing to rank and shoppers no orientation.",
        whyItMatters:
          "Collection pages are usually a store's strongest ranking candidates for category keywords — but only when they contain actual content.",
        expectedImpact: "Category-level organic traffic this page currently can't capture.",
        aiRecommendation:
          "Generate a 2-3 sentence collection description that names the category, who it's for, and what makes this selection worth browsing.",
        fix: {
          kind: "automated",
          action: "generate_collection_description",
          params: { collectionId: collection.id, collectionTitle: collection.title },
        },
      });
    }

    if (!collection.hasImage) {
      findings.push({
        category: "design",
        severity: "low",
        title: `Collection "${collection.title}" has no image`,
        explanation: "Anywhere the store shows collection cards, this one renders as a gray placeholder.",
        whyItMatters: "Collection imagery does the visual selling on the homepage and navigation; a placeholder breaks the browsing experience.",
        expectedImpact: "More clicks into the collection from the homepage and menus.",
        aiRecommendation: "Set a representative product photo or a branded banner as the collection image.",
        fix: { kind: "manual", action: "add_collection_image", params: { collectionId: collection.id } },
      });
    }
  }

  return findings;
}

const POLICY_LABELS: Record<string, string> = {
  REFUND_POLICY: "Refund policy",
  PRIVACY_POLICY: "Privacy policy",
  TERMS_OF_SERVICE: "Terms of service",
  SHIPPING_POLICY: "Shipping policy",
};

export function checkPolicies(policies: ScannedPolicies): Finding[] {
  const findings: Finding[] = [];
  const present = new Set(policies.types);

  const missing = Object.entries(POLICY_LABELS).filter(([type]) => !present.has(type));
  for (const [type, label] of missing) {
    const isRefundOrShipping = type === "REFUND_POLICY" || type === "SHIPPING_POLICY";
    findings.push({
      category: "trust",
      severity: isRefundOrShipping ? "high" : "medium",
      title: `${label} is missing`,
      explanation: `The store has no ${label.toLowerCase()} published, so the standard footer link shoppers look for either doesn't exist or is empty.`,
      whyItMatters: isRefundOrShipping
        ? "\"Can I return it?\" and \"when will it arrive?\" are the two questions nearly every first-time buyer checks before paying. No answer means no purchase."
        : "Legal policies are baseline trust infrastructure — their absence is a red flag for careful shoppers and can violate payment-provider requirements.",
      expectedImpact: "Fewer abandoned checkouts from unanswered trust questions.",
      aiRecommendation: `Publish a ${label.toLowerCase()} in Shopify Settings → Policies. Shopify provides templates you can adapt in minutes.`,
      fix: { kind: "manual", action: "publish_policy", params: { policyType: type } },
    });
  }

  return findings;
}

export function checkNavigation(menus: ScannedMenu[]): Finding[] {
  const findings: Finding[] = [];

  const mainMenu = menus.find((m) => m.handle === "main-menu");
  if (mainMenu && mainMenu.itemCount < 3) {
    findings.push({
      category: "conversion",
      severity: "medium",
      title: `Main navigation has only ${mainMenu.itemCount} item${mainMenu.itemCount === 1 ? "" : "s"}`,
      explanation: "The header menu gives shoppers almost no paths into the catalog.",
      whyItMatters:
        "Navigation is how browsing shoppers discover what else you sell. A near-empty menu strands them on whatever page they landed on.",
      expectedImpact: "More pages per visit and more product discovery.",
      aiRecommendation:
        "Add your top collections and key pages (About, Contact) to the main menu — aim for 4-7 items.",
      fix: { kind: "manual", action: "expand_main_menu" },
    });
  }

  const footerMenu = menus.find((m) => m.handle === "footer");
  if (!footerMenu || footerMenu.itemCount === 0) {
    findings.push({
      category: "trust",
      severity: "low",
      title: "Footer menu is empty or missing",
      explanation: "The footer has no links to policies, contact, or about pages.",
      whyItMatters:
        "The footer is where skeptical shoppers go to verify a store is real. An empty one fails that check instantly.",
      expectedImpact: "A standard, trust-building footer that answers due-diligence questions.",
      aiRecommendation: "Add policies, contact, and about links to the footer menu.",
      fix: { kind: "manual", action: "populate_footer_menu" },
    });
  }

  return findings;
}

export function checkTrustPages(pages: ScannedPage[]): Finding[] {
  const findings: Finding[] = [];
  const handles = pages.map((p) => `${p.handle} ${p.title}`.toLowerCase());

  if (!handles.some((h) => h.includes("contact"))) {
    findings.push({
      category: "trust",
      severity: "medium",
      title: "No contact page found",
      explanation: "The store has no page telling shoppers how to reach a human.",
      whyItMatters:
        "\"Can I reach someone if this goes wrong?\" is a make-or-break trust check, especially for first-time customers of an unknown brand.",
      expectedImpact: "Higher first-purchase conversion from trust-sensitive shoppers.",
      aiRecommendation:
        "Create a contact page with an email address or contact form, expected response time, and business location if applicable.",
      fix: { kind: "manual", action: "create_contact_page" },
    });
  }

  if (!handles.some((h) => h.includes("about"))) {
    findings.push({
      category: "trust",
      severity: "low",
      title: "No about page found",
      explanation: "There is no page telling the store's story or showing who is behind it.",
      whyItMatters:
        "An about page humanizes the store and is a standard stop for shoppers deciding whether a small brand is legitimate.",
      expectedImpact: "A stronger brand impression and another trust checkpoint passed.",
      aiRecommendation: "Create a short about page: who you are, why you started, and what you stand behind.",
      fix: { kind: "manual", action: "create_about_page" },
    });
  }

  return findings;
}

export function checkHomepage(home: ScannedHomepage): Finding[] {
  const findings: Finding[] = [];

  if (!home.title || home.title.length < 10) {
    findings.push({
      category: "seo",
      severity: "high",
      title: "Homepage title tag is missing or too short",
      explanation: `The homepage <title> is ${home.title ? `only "${home.title}"` : "missing entirely"}.`,
      whyItMatters:
        "The homepage title is the store's single most important SEO element — it's the headline for every branded search.",
      expectedImpact: "Better rankings and a stronger branded search result.",
      aiRecommendation:
        "Set a homepage title like \"[Store name] — [what you sell] [differentiator]\" in Online Store → Preferences.",
      fix: { kind: "manual", action: "set_homepage_title" },
    });
  }

  if (!home.metaDescription) {
    findings.push({
      category: "seo",
      severity: "high",
      title: "Homepage has no meta description",
      explanation: "The homepage lacks a meta description, so search engines improvise the snippet under the store name.",
      whyItMatters:
        "This snippet is what people read after searching your brand name. Leaving it to chance wastes the highest-intent traffic you have.",
      expectedImpact: "Higher click-through on branded searches — the cheapest traffic gain available.",
      aiRecommendation:
        "Write a 150-character homepage description covering what you sell and your key differentiator, in Online Store → Preferences.",
      fix: { kind: "manual", action: "set_homepage_meta_description" },
    });
  }

  if (!home.hasH1) {
    findings.push({
      category: "accessibility",
      severity: "medium",
      title: "Homepage has no H1 heading",
      explanation: "The homepage markup contains no <h1>, so the page has no machine-readable main heading.",
      whyItMatters:
        "Screen readers and search crawlers both use the H1 to understand what a page is about; skipping it hurts accessibility and SEO together.",
      expectedImpact: "Improved accessibility score and clearer page semantics for search.",
      aiRecommendation: "Ensure the hero section renders its headline as an H1 (usually a theme setting).",
      fix: { kind: "manual", action: "fix_homepage_h1" },
    });
  }

  if (home.totalImages > 0 && home.imagesMissingAlt / home.totalImages > 0.3) {
    findings.push({
      category: "accessibility",
      severity: "medium",
      title: `${home.imagesMissingAlt} of ${home.totalImages} homepage images lack ALT text`,
      explanation: "A large share of homepage imagery has no alternative text.",
      whyItMatters:
        "The homepage is the most-visited page; missing ALT text there affects the most users and weighs heaviest in accessibility audits.",
      expectedImpact: "A meaningful accessibility improvement on the highest-traffic page.",
      aiRecommendation:
        "Add ALT text to homepage section images in the theme editor; product images can be fixed from their product pages.",
      fix: { kind: "manual", action: "fix_homepage_alt_text" },
    });
  }

  if (!home.ogImage) {
    findings.push({
      category: "seo",
      severity: "low",
      title: "Homepage has no social sharing image",
      explanation: "There is no og:image tag, so links to the store render without a preview image on social platforms and in messengers.",
      whyItMatters: "A bare link preview gets dramatically fewer clicks than one with an image — every shared link is currently underperforming.",
      expectedImpact: "Better click-through on every shared store link.",
      aiRecommendation: "Set a social sharing image in Online Store → Preferences.",
      fix: { kind: "manual", action: "set_social_image" },
    });
  }

  if (home.htmlBytes > 1_500_000) {
    findings.push({
      category: "performance",
      severity: "medium",
      title: `Homepage HTML is very heavy (${(home.htmlBytes / 1_000_000).toFixed(1)} MB)`,
      explanation: "The raw HTML document alone — before images and scripts load — is unusually large.",
      whyItMatters:
        "Heavy pages are slow pages, and homepage load time directly correlates with bounce rate, especially on mobile connections.",
      expectedImpact: "Faster first paint and fewer bounced mobile visitors.",
      aiRecommendation:
        "Audit theme sections for inlined data or excessive markup; remove unused sections and apps that inject content.",
      fix: { kind: "manual", action: "reduce_homepage_weight" },
    });
  }

  if (home.scriptCount > 40) {
    findings.push({
      category: "performance",
      severity: "medium",
      title: `Homepage loads ${home.scriptCount} scripts`,
      explanation: "An unusually high number of script tags suggests accumulated app snippets and tracking pixels.",
      whyItMatters:
        "Every script competes for the phone's CPU before the page becomes usable. App leftovers are the most common cause of slow Shopify stores.",
      expectedImpact: "A noticeably faster store, particularly on mid-range mobile devices.",
      aiRecommendation:
        "Remove uninstalled apps' leftover script tags and consolidate analytics tools — most stores can cut a third of their scripts painlessly.",
      fix: { kind: "manual", action: "reduce_script_count" },
    });
  }

  return findings;
}
