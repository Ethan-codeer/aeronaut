import Link from "next/link";
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
