import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/home",
          "/analytics/",
          "/portfolio-construction/",
          "/strategy-builder/build",
          "/alpha-machine/build-screen",
          "/alpha-machine/build-model",
          "/alpha-machine/upload-factors",
          "/alpha-machine/code-editor",
          "/risk-model/",
          "/optimizer",
          "/settings",
          "/admin/",
        ],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || "https://capitalai.com"}/sitemap.xml`,
  };
}
