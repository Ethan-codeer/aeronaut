import Link from "next/link";
import { notFound } from "next/navigation";
import { liveries, getLivery } from "@/data/liveries";
import { getAirline } from "@/data/airlines";
import { PageHeading } from "@/components/ui";
import { LicensedPhoto } from "@/components/licensed-photo";
export function generateStaticParams() {
  return liveries.map((l) => ({ slug: l.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return { title: getLivery((await params).slug)?.name || "涂装未找到" };
}
export default async function Livery({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const l = getLivery((await params).slug);
  if (!l) notFound();
  const a = getAirline(l.airlineSlug)!;
  return (
    <div className="container page-content">
      <Link href="/world/liveries" className="back-link">
        ← 返回涂装博物馆
      </Link>
      <PageHeading
        eyebrow={`${l.category} / ${a.nameEn}`}
        title={l.name}
        description={`${a.nameZh} · ${l.aircraftModel}`}
      />
      <LicensedPhoto
        media={l.media}
        alt={`${a.nameZh} ${l.name} ${l.aircraftModel}真实航空摄影`}
      />
      <div className="detail-layout section">
        <article className="paper-panel reading-panel">
          <h2>视觉设计</h2>
          <p>{l.design}</p>
          <h2>背景故事</h2>
          <p>{l.story}</p>
          <h2>关于这家航司</h2>
          <p>{a.history}</p>
          <Link href={`/world/airlines/${a.slug}`} className="text-link">
            {a.nameZh}百科 ↗
          </Link>
          <h2>继续探索</h2>
          <div className="related-links">
            {l.aircraftSlug && (
              <Link href={`/atlas/${l.aircraftSlug}`}>照片所示机型百科 ↗</Link>
            )}
            <Link href="/academy/tails">看机尾猜航司 ↗</Link>
          </div>
        </article>
        <aside className="paper-panel reading-panel">
          <h2>藏品资料</h2>
          <p>代表性机型：{l.aircraftModel}</p>
          <p>使用时期：{l.periodNote}</p>
          <p>具体注册号：本条未独立核实，不作断言。</p>
          {l.photoDate && (
            <p>原图拍摄日期字段：{l.photoDate}（不等于使用期）</p>
          )}
          <p>
            资料整理：{l.verifiedAt}
            。设计特点为照片观察摘要，非官方设计意图声明。
          </p>
          <h2>来源与版权</h2>
          {l.sources.map((s) => (
            <a
              className="text-link"
              href={s.url}
              key={s.url}
              target="_blank"
              rel="noreferrer"
            >
              {s.label} ↗
            </a>
          ))}
        </aside>
      </div>
    </div>
  );
}
