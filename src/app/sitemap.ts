import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/discover`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  try {
    const projects = await prisma.project.findMany({
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 500,
    });

    return [
      ...staticRoutes,
      ...projects.map((project) => ({
        url: `${baseUrl}/projects/${project.id}`,
        lastModified: project.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
