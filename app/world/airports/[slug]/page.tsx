import Link from "next/link";
import { notFound } from "next/navigation";
import { airports, getAirport } from "@/data/airports";
import { getAirline } from "@/data/airlines";
import { PageHeading } from "@/components/ui";
export function generateStaticParams() {
  return airports.map((a) => ({ slug: a.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const a = getAirport((await params).slug);
  return { title: a ? `${a.iata} · ${a.nameZh}` : "机场未找到" };
}
export default async function Airport({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const a = getAirport((await params).slug);
  if (!a) notFound();
  const sections = [
    ["overview", "Overview — 机场概览"],
    ["history", "History — 发展历史"],
    ["terminals", "Terminals — 航站楼"],
    ["network", "Airlines & Network — 航司与航线"],
    ["architecture", "Architecture & Technology — 建筑与技术"],
    ["transport", "Transport & Facilities — 交通与设施"],
    ["stories", "Aviation Stories — 航空故事"],
  ] as const;
  return (
    <div className="container page-content">
      <Link className="back-link" href="/world/airports">
        ← 返回全球机场
      </Link>
      <PageHeading
        eyebrow={`${a.iata} / ${a.icao} · ${a.region}`}
        title={a.nameZh}
        description={a.nameEn}
      />
      <div className="detail-layout">
        <article className="paper-panel reading-panel">
          <h2>
            {a.city} · {a.country}
          </h2>
          <nav className="airport-section-nav" aria-label="机场详情章节">
            {sections
              .filter(([id]) => a.sections[id])
              .map(([id, title]) => (
                <a key={id} href={`#airport-${id}`}>
                  {title.split(" — ")[1]}
                </a>
              ))}
          </nav>
          {sections.map(([id, title]) =>
            a.sections[id] ? (
              <section key={id} id={`airport-${id}`}>
                <h2>{title}</h2>
                <p className={id === "overview" ? "lead-copy" : undefined}>
                  {a.sections[id]}
                </p>
              </section>
            ) : null,
          )}
          <h2>机场网络</h2>
          <p>{a.hubNote}</p>
          <div className="related-links">
            {a.hubAirlineSlugs.map((slug) => {
              const airline = getAirline(slug);
              return airline ? (
                <Link key={slug} href={`/world/airlines/${slug}`}>
                  {airline.nameZh} · {airline.iata} ↗
                </Link>
              ) : null;
            })}
          </div>

          <h2>再探索一步</h2>
          <div className="related-links">
            <Link href="/dictionary/hub">什么是枢纽机场？ ↗</Link>
            <Link href="/dictionary/etops">备降机场与ETOPS ↗</Link>
            <Link href="/world/airports#challenge">参加机场地理挑战 ↗</Link>
          </div>
        </article>
        <aside className="spec-panel">
          <h2>地理档案</h2>
          {[
            ["IATA", a.iata],
            ["ICAO", a.icao],
            ["时区", a.timezone],
            ["机场类型", a.airportType],
            ["纬度", `${a.latitude.toFixed(6)}°`],
            ["经度", `${a.longitude.toFixed(6)}°`],
            [
              "机场标高",
              `${a.elevationFt.toLocaleString()} ft / 约 ${Math.round(a.elevationFt * 0.3048)} m`,
            ],
            ["核对日期", a.verifiedAt],
          ].map(([k, v]) => (
            <div className="spec-row" key={k}>
              <span>{k}</span>
              <b>{v}</b>
            </div>
          ))}
          <p>{a.verificationNote}</p>
          <a
            href={a.website}
            className="text-link"
            target="_blank"
            rel="noreferrer"
          >
            {a.website.includes("ourairports.com")
              ? "机场开放数据记录 ↗"
              : "机场网站（参考入口） ↗"}
          </a>
        </aside>
      </div>
      <section className="paper-panel reading-panel">
        <h2>资料来源</h2>
        <p>
          位置、代码和标高来自 OurAirports
          公有领域开放资料。资料为教育用途，不能替代官方AIP、NOTAM或航行资料。
        </p>
        <div className="source-links">
          {a.sources.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
              {s.label} ↗
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
