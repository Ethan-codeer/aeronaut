import Link from "next/link";
import { airlinesForAircraft } from "@/data/airlines";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowLeftRight,
  ExternalLink,
  Check,
  Eye,
  CalendarDays,
} from "lucide-react";
import { aircraft, getAircraft, specLabels, SpecKey } from "@/data/aircraft";
import { AircraftCard, Favorite, SafeImage, Visit } from "@/components/ui";
export function generateStaticParams() {
  return aircraft.map((a) => ({ slug: a.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getAircraft(slug);
  return {
    title: a ? `${a.manufacturer} ${a.model}` : "机型未找到",
    description: a?.intro,
  };
}
export default async function AircraftDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getAircraft(slug);
  if (!a) notFound();
  const related = aircraft
    .filter((b) => b.id !== a.id && b.category === a.category)
    .slice(0, 3);
  return (
    <div className="container page-content">
      <Visit slug={slug} />
      <Link href="/atlas" className="back-link">
        <ArrowLeft size={15} />
        返回飞机百科
      </Link>
      <div className="detail-heading">
        <div>
          <span className="eyebrow blue">
            {a.manufacturer.toUpperCase()} / {a.category}
          </span>
          <h1>{a.model}</h1>
          <p>{a.intro}</p>
        </div>
        <div className="button-row">
          <Favorite slug={slug} large />
          <Link className="button primary" href={`/atlas/compare?a=${slug}`}>
            <ArrowLeftRight size={17} />
            加入对比
          </Link>
        </div>
      </div>
      <div className="module-links">
        <Link href="/lab/anatomy">探索典型双发客机结构 ↗</Link>
        <Link href="/dictionary/mtow">读懂机型参数术语 ↗</Link>
      </div>
      <figure className="detail-figure">
        <SafeImage
          src={a.image}
          alt={`${a.model}${a.imageSource ? " 飞机照片" : " 原创示意图"}`}
        />
        <figcaption>
          {a.imageSource ? (
            <>
              <a href={a.imageSource} target="_blank" rel="noreferrer">
                © {a.imageCredit}
              </a>{" "}
              ·{" "}
              {a.imageLicenseUrl ? (
                <a href={a.imageLicenseUrl} target="_blank" rel="noreferrer">
                  授权条款
                </a>
              ) : (
                <span>公有领域</span>
              )}
            </>
          ) : (
            a.imageCredit
          )}
        </figcaption>
      </figure>
      <div className="detail-layout">
        <article>
          <span className="eyebrow blue">THE STORY</span>
          <h2>为飞行而生</h2>
          <p className="body-copy">{a.description}</p>
          <div className="info-row">
            <CalendarDays size={20} />
            <span>
              首飞日期 <b>{a.firstFlight}</b>
            </span>
            <a
              href={a.sources.firstFlight}
              target="_blank"
              rel="noreferrer"
              aria-label="首飞资料来源"
            >
              <ExternalLink size={15} />
            </a>
          </div>
          <h2 className="subheading">
            <Eye size={23} />
            如何认出它
          </h2>
          <ul className="recognition-list">
            {a.recognition.map((s, i) => (
              <li key={s}>
                <span>0{i + 1}</span>
                {s}
              </li>
            ))}
          </ul>
          <h2 className="subheading">技术亮点</h2>
          <div className="highlight-list">
            {a.highlights.map((s) => (
              <span key={s}>
                <Check size={16} />
                {s}
              </span>
            ))}
          </div>
          <h2 className="subheading">动力与客舱</h2>
          <p className="body-copy">
            {a.engine}{" "}
            <a
              href={a.sources.engine}
              target="_blank"
              rel="noreferrer"
              className="inline-link"
            >
              动力来源 ↗
            </a>
            <br />
            {a.layout}
          </p>
          <div className="notice">{a.note}</div>
        </article>
        <aside className="spec-panel">
          <span className="eyebrow blue">TECHNICAL DATA</span>
          <h2>飞机档案</h2>
          {(Object.keys(specLabels) as SpecKey[]).map((k) => (
            <div className="spec-row" key={k}>
              <span>
                {specLabels[k].label}
                <a
                  href={a.sources[k]}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${specLabels[k].label}来源`}
                >
                  <ExternalLink size={12} />
                </a>
              </span>
              <b>
                {a.specs[k] === null ? "待核实" : a.specs[k]?.toLocaleString()}{" "}
                <small>{a.specs[k] !== null && specLabels[k].unit}</small>
              </b>
            </div>
          ))}
          <p>
            每项参数旁的 ↗
            可打开来源。马赫数为典型近似值，实际值随飞行条件变化。
          </p>
        </aside>
      </div>
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow blue">AROUND THE WORLD</span>
            <h2>代表性运营航司</h2>
            <p>以有来源的机队资料建立关联，不根据照片涂装判断当前运营状态。</p>
          </div>
        </div>
        {airlinesForAircraft(slug).length ? (
          <div className="two-columns">
            {airlinesForAircraft(slug).map((airline) => {
              const relation = airline.fleet.find(
                (f) => f.aircraftSlug === slug,
              )!;
              return (
                <article className="paper-panel" key={airline.slug}>
                  <span className="eyebrow blue">
                    {airline.iata} / {airline.country}
                  </span>
                  <h3>
                    <Link href={`/world/airlines/${airline.slug}`}>
                      {airline.nameZh} ↗
                    </Link>
                  </h3>
                  <p>{airline.nameEn}</p>
                  <a
                    className="text-link"
                    href={relation.source}
                    target="_blank"
                    rel="noreferrer"
                  >
                    机队依据 · {relation.asOf} ↗
                  </a>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="notice">
            本站尚未加入经核实的代表航司关系，后续扩充。
            <Link href="/world/airlines" className="inline-link">
              浏览全球航司 ↗
            </Link>
          </div>
        )}
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow blue">KEEP EXPLORING</span>
            <h2>下一架，遇见谁？</h2>
          </div>
        </div>
        <div className="atlas-grid">
          {(related.length
            ? related
            : aircraft.filter((b) => b.id !== a.id).slice(0, 3)
          ).map((b) => (
            <AircraftCard key={b.id} aircraft={b} />
          ))}
        </div>
      </section>
    </div>
  );
}
