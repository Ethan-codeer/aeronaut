import Link from "next/link";
import { notFound } from "next/navigation";
import { terms, getTerm } from "@/data/dictionary";
import { PageHeading } from "@/components/ui";
export function generateStaticParams() {
  return terms.map((t) => ({ slug: t.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const t = getTerm((await params).slug);
  return { title: t ? `${t.nameZh} · ${t.nameEn}` : "术语未找到" };
}
export default async function Term({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const t = getTerm((await params).slug);
  if (!t) notFound();
  return (
    <div className="container page-content">
      <Link className="back-link" href="/dictionary">
        ← 返回词典
      </Link>
      <PageHeading
        eyebrow={`${t.category} / ${t.abbreviation || "TERM"}`}
        title={t.nameZh}
        description={t.nameEn}
      />
      <div className="detail-layout">
        <article className="paper-panel reading-panel">
          <h2>一句话理解</h2>
          <p className="lead-copy">{t.definition}</p>
          <h2>深入了解</h2>
          <p>{t.explanation}</p>
          <h2>使用场景</h2>
          <p>{t.scenario}</p>
          <h2>常见误区</h2>
          <div className="notice">{t.misconception}</div>
          <h2>参考来源</h2>
          <div className="source-links">
            {t.sources.map((s) => (
              <a href={s.url} key={s.url} target="_blank" rel="noreferrer">
                {s.label} ↗
              </a>
            ))}
          </div>
        </article>
        <aside className="paper-panel reading-panel">
          <h2>关联术语</h2>
          <div className="related-links">
            {t.related.map((s) => {
              const r = getTerm(s);
              return r ? (
                <Link href={`/dictionary/${s}`} key={s}>
                  {r.nameZh} · {r.abbreviation || r.nameEn} ↗
                </Link>
              ) : null;
            })}
          </div>
          <h2>去体验这个概念</h2>
          {t.knowledgeLinks.map((l) => (
            <Link className="button secondary" href={l.href} key={l.href}>
              {l.label} ↗
            </Link>
          ))}
        </aside>
      </div>
    </div>
  );
}
