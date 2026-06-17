import Image from "next/image";
import Link from "next/link";
import { type Article, formatDate } from "@/data/blog";
import { type Article, formatDate, pdfFirstPageImage } from "@/data/blog";
import { ArrowRight, DownloadIcon } from "@/components/Icons";

/** Force a download: ImageKit uses ?ik-attachment=true. */
const downloadUrl = (url: string) =>
  url.includes("ik.imagekit.io")
    ? url + (url.includes("?") ? "&" : "?") + "ik-attachment=true"
    : url;

export function ArticleView({ article, more }: { article: Article; more: Article[] }) {
  // DB `description` = full content, blank lines separate the paragraphs.
  const paragraphs = (article.body ?? "")
    .split(/\r?\n\s*\r?\n|\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const pdfPreview = article.pdf ? pdfFirstPageImage(article.pdf) : "";

  return (
    <article className="container-max max-w-3xl py-12">
      <Link href="/blog" className="mb-6 inline-flex items-center gap-1 text-sm text-primary-container hover:text-primary">
        ← Retour au blog
      </Link>

      <span className="mb-4 block w-fit rounded-full bg-primary/10 px-3 py-1 font-mono text-label-caps uppercase text-primary">
        {article.category}
      </span>
      <h1 className="mb-3 font-display text-[40px] font-bold leading-tight text-primary-container">
        {article.title}
      </h1>
      <p className="mb-8 text-sm text-on-surface-variant">Publié le {formatDate(article.date)}</p>

      {article.cover && (
        <div className="relative mb-8 h-72 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low">
          <Image src={article.cover} alt={article.title} fill className="object-contain p-6" />
        </div>
      )}

      <div className="space-y-5 leading-relaxed text-on-surface">
        {paragraphs.length > 0 ? (
          paragraphs.map((p, i) =>
            i === 0 ? (
              <p key={i} className="text-lg text-on-surface-variant">{p}</p>
            ) : (
              <p key={i}>{p}</p>
            )
          )
        ) : (
          !article.pdf && <p className="text-lg text-on-surface-variant">{article.excerpt}</p>
        )}
      </div>

      {/* Attached document — inline viewer + download */}
      {article.pdf && (
        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-headline-md text-primary-container">Document</h2>
            <a href={downloadUrl(article.pdf)} className="btn-solid">
              <DownloadIcon className="h-5 w-5" />
              Télécharger le PDF
            </a>
          </div>
          <iframe
            src={article.pdf}
            title={`Document : ${article.title}`}
            className="h-[75vh] w-full rounded-lg border border-outline-variant bg-clinical-white"
          />
          <a
            href={article.pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="group block overflow-hidden rounded-lg border border-outline-variant bg-clinical-white transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-[3/4] w-full bg-surface-container-low sm:aspect-[4/5]">
              <Image
                src={pdfPreview}
                alt={`PremiÃ¨re page du document : ${article.title}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          </a>
          <p className="mt-2 text-sm text-on-surface-variant">
            Si le document ne s&apos;affiche pas,{" "}
            <a href={article.pdf} target="_blank" rel="noopener noreferrer" className="text-primary-container underline hover:text-primary">
              ouvrez-le dans un nouvel onglet
            </a>.
          </p>
        </section>
      )}

      <section className="mt-16 border-t border-outline-variant pt-8">
        <h2 className="mb-6 font-display text-headline-md text-primary-container">À lire également</h2>
        <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2">
          {more.map((a) => (
            <Link
              key={a.slug}
              href={`/blog/${a.slug}`}
              className="group flex items-center justify-between gap-4 rounded-lg border border-outline-variant bg-surface-gray p-5 transition-shadow hover:shadow-md"
            >
              <span className="font-display font-semibold text-on-surface group-hover:text-primary">{a.title}</span>
              <ArrowRight className="h-5 w-5 shrink-0 text-primary-container" />
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
