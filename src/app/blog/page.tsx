import type { Metadata } from "next";
import { BlogView } from "@/components/BlogView";
import { getArticles } from "@/lib/server-data";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Actualités, innovations et conseils cliniques en ophtalmologie par OphtaHealth. Analyses du secteur pour les professionnels de la vision.",
};

/** ISR safety net — the admin dashboard revalidates on-demand after writes. */
export const revalidate = 3600;

export default async function BlogPage() {
  const articles = await getArticles();
  return <BlogView articles={articles} />;
}
