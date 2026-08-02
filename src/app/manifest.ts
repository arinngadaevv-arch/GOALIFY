import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GOALIFY — Your body, engineered",
    short_name: "GOALIFY",
    description:
      "A personalised training and nutrition system built around your goals, your fitness level and your joints. 3D AI form coaching on every rep.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0e14",
    theme_color: "#0b0e14",
    lang: "en",
    dir: "ltr",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
