import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TrendSpark AI",
    short_name: "TrendSpark",
    description:
      "מחולל תוכן ויראלי AI לטיקטוק ואינסטגרם לעסקים קטנים",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0a0a12",
    theme_color: "#0a0a12",
    lang: "he",
    dir: "rtl",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
