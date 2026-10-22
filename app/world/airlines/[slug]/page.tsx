import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import { airlines, getAirline, AirlineMedia } from "@/data/airlines";
import { getAircraft } from "@/data/aircraft";
import { AircraftCard, PageHeading } from "@/components/ui";
export function generateStaticParams() {
  return airlines.map((a) => ({ slug: a.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const a = getAirline((await params).slug);
  return { title: a ? `${a.nameZh} · ${a.nameEn}` : "航司未找到" };
}
function Attribution({ media }: { media: AirlineMedia }) {
  return (
    <figcaption>
      © {media.attribution} · {media.license} ·{" "}
      <a href={media.source} target="_blank" rel="noreferrer">
        图片与授权来源 ↗
      </a>
      {media.licenseUrl && (
        <>
          {" "}
          ·{" "}
          <a href={media.licenseUrl} target="_blank" rel="noreferrer">
            许可条款 ↗
          </a>
        </>
      )}
    </figcaption>
  );
}
export default async function AirlineDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const a = getAirline((await params).slug);
  if (!a) notFound();
  return (
    <div className="container page-content">
      <Link href="/world/airlines" className="back-link">
        <ArrowLeft size={15} />
        返回全球航空公司
      </Link>
      <PageHeading
        eyebrow={`${a.iata} / ${a.icao} · ${a.country}`}
        title={a.nameZh}
        description={a.nameEn}
      />
      <div className="detail-layout">
        <article>
          <div className="airline-brand-panel">
            {a.logo ? (
              <figure className="airline-logo">
                <img
                  src={a.logo.file}
                  alt={`${a.nameZh}标志`}
                  width="220"
                  height="90"
                />
                <Attribution media={a.logo} />
              </figure>
            ) : (
              <p className="muted">
                公司标志：待补充经授权核实的图像。可通过下方官方资料了解品牌。
              </p>
            )}
            <span className="airline-code" aria-label={`IATA 代码 ${a.iata}`}>
              {a.iata}
            </span>
          </div>
          <h2>连接世界的航程</h2>
          <p className="body-copy">{a.history}</p>
          <h2 className="subheading">值得了解的故事</h2>
          <p className="body-copy">{a.story}</p>
          <h2 className="subheading">代表性涂装</h2>
          {a.livery ? (
            <figure className="airline-livery">
              <img
                loading="lazy"
                src={a.livery.file}
                alt={`${a.nameZh}代表性涂装照片`}
              />
              <Attribution media={a.livery} />
            </figure>
          ) : (
            <div className="notice">
              涂装照片待补充：尚未完成可再利用图片的授权审核。
            </div>
          )}
          <p className="body-copy">{a.liveryDescription}</p>
          <p className="muted">
            照片用于介绍品牌与历史，不作为当前机队运营状态的证据。商标归相应权利人所有。
          </p>
        </article>
        <aside className="spec-panel">
          <span className="eyebrow blue">AIRLINE PROFILE</span>
          <h2>航司档案</h2>
          {[
            ["国家或地区", a.country],
            ["总部", a.headquarters],
            ["IATA", a.iata],
            ["ICAO", a.icao],
            ["成立年份", String(a.foundedYear)],
            ["航空联盟", a.alliance],
          ].map(([label, value]) => (
            <div className="spec-row" key={label}>
              <span>{label}</span>
              <b>{value}</b>
            </div>
          ))}
          <p>{a.foundedNote}</p>
          <p>资料核对：{a.verifiedAt}。联盟、机队可能变化；不提供实时状态。</p>
          <Link href="/academy/airlines" className="button primary">
            航司挑战
            <ArrowUpRight size={16} />
          </Link>
        </aside>
      </div>
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow blue">MEET THE FLEET</span>
            <h2>认识它的代表性机型</h2>
            <p>
              仅列出与本站飞机百科对应、具备资料依据的运营关系，非完整机队。
            </p>
          </div>
        </div>
        <div className="atlas-grid">
          {a.fleet.map((f) => {
            const plane = getAircraft(f.aircraftSlug);
            return plane ? (
              <div key={f.aircraftSlug}>
                <AircraftCard aircraft={plane} />
                <p className="fleet-source">
                  <a href={f.source} target="_blank" rel="noreferrer">
                    机队依据 ↗
                  </a>{" "}
                  · 资料日期 {f.asOf}
                </p>
              </div>
            ) : null;
          })}
        </div>
        {!a.fleet.length && (
          <div className="notice">精确子型号运营关系待进一步核实。</div>
        )}
      </section>
      <section className="paper-panel">
        <h2>信息来源与核实日期</h2>
        {a.sourceAccessNote && <p className="notice">{a.sourceAccessNote}</p>}
        <div className="source-links">
          {a.sources.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
              {s.label}
              <ExternalLink size={13} /> · 核对 {s.checkedAt}
            </a>
          ))}
        </div>
        {a.pending.length > 0 && (
          <p className="muted">待补充：{a.pending.join("；")}</p>
        )}
      </section>
    </div>
  );
}
