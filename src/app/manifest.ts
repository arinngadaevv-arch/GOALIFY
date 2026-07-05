import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TrendSpark AI",
    short_name: "TrendSpark",
    description:
      "מערכת קבלת החלטות לעסקים קטנים - מהלך אחד ברור בכל שבוע, עם ביטחון כנה",
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
