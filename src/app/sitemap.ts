import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://funny-tools.vercel.app/",
    },
    {
      url: "https://funny-tools.vercel.app/zip",
    },
    {
      url: "https://funny-tools.vercel.app/png",
    },
  ];
}
