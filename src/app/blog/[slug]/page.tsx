import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticles } from "@/lib/server-data";
import { ArticleView } from "@/components/ArticleView";

/**
 * Hybrid strategy: known slugs are prerendered, articles created in the
 * admin afterwards render on demand; /api/revalidate refreshes after writes.
 */
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const articles = await getArticles();
  const article = articles.find((a) => a.slug === slug);
  if (!article) return { title: "Article introuvable" };
  return { title: article.title, description: article.excerpt };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const articles = await getArticles();
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();

  const more = articles.filter((a) => a.slug !== article.slug).slice(0, 2);
  return <ArticleView article={article} more={more} />;
}
