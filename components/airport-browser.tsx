"use client";
import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { airports, filterAirports, regions, getAirport } from "@/data/airports";
const AirportMap = dynamic(() => import("./airport-map"), {
  ssr: false,
  loading: () => (
    <div className="notice" role="status">
      地图组件加载中；机场列表可立即使用。
    </div>
  ),
});
export function AirportBrowser() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("全部");
  const [country, setCountry] = useState("全部");
  const [view, setView] = useState("地图与列表");
  const [selected, setSelected] = useState<string | undefined>();
  const results = useMemo(
    () =>
      filterAirports(query, region).filter(
        (a) => country === "全部" || a.country === country,
      ),
    [query, region, country],
  );
  const a =
    selected && results.some((a) => a.slug === selected)
      ? getAirport(selected)
      : undefined;
  return (
    <>
      <div className="explore-toolbar">
        <label className="search-field">
          搜索机场 / 城市 / IATA / ICAO
          <input
            type="search"
            placeholder="例如：香港、JFK、ZBAA"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          地区
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            {["全部", ...regions].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label>
          国家与地区
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            {["全部", ...new Set(airports.map((a) => a.country))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <div className="segmented" aria-label="浏览视图">
          {["地图与列表", "列表"].map((v) => (
            <button
              key={v}
              aria-pressed={view === v}
              onClick={() => setView(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <p className="result-count" role="status">
        {results.length} / {airports.length} 座机场 · 离线资料快照，不含实时航班
      </p>
      {view === "地图与列表" && (
        <AirportMap
          items={results}
          selected={selected}
          onSelect={setSelected}
        />
      )}
      <div aria-live="polite">
        {a && (
          <article className="paper-panel airport-selected">
            <span className="airport-code">
              {a.iata} / {a.icao}
            </span>
            <div>
              <h2>{a.nameZh}</h2>
              <p>
                {a.nameEn} · {a.city} / {a.country}
              </p>
              <p>{a.shortDescription ?? a.overview}</p>
              <Link href={`/world/airports/${a.slug}`} className="text-link">
                查看机场档案 ↗
              </Link>
            </div>
            <button
              className="icon-btn"
              aria-label="关闭机场卡片"
              onClick={() => setSelected(undefined)}
            >
              ×
            </button>
          </article>
        )}
      </div>
      <div className="explore-grid airport-list">
        {results.map((a) => (
          <article
            key={a.slug}
            className={`paper-panel ${selected === a.slug ? "selected-card" : ""}`}
          >
            <div className="airport-card-top">
              <span className="airport-code">{a.iata}</span>
              <span>
                {a.region} · {a.icao}
              </span>
            </div>
            <h2>
              <Link href={`/world/airports/${a.slug}`}>{a.nameZh}</Link>
            </h2>
            <p>{a.nameEn}</p>
            <p>
              {a.city} · {a.country}
            </p>
            <div className="button-row">
              <button
                className="text-link"
                onClick={() => {
                  setSelected(a.slug);
                }}
              >
                显示详情卡片
              </button>
              <Link className="text-link" href={`/world/airports/${a.slug}`}>
                机场档案 ↗
              </Link>
            </div>
          </article>
        ))}
      </div>
      {!results.length && (
        <div className="notice">
          没有匹配的机场。
          <button
            className="button secondary"
            onClick={() => {
              setQuery("");
              setRegion("全部");
              setCountry("全部");
            }}
          >
            清除筛选
          </button>
        </div>
      )}
    </>
  );
}
