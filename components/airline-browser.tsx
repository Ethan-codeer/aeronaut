"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, ArrowUpRight } from "lucide-react";
import { airlines, Airline } from "@/data/airlines";
export function AirlineCard({ airline: a }: { airline: Airline }) {
  return (
    <Link
      href={`/world/airlines/${a.slug}`}
      className="paper-panel airline-card"
    >
      <div className="airline-card-top">
        <span className="airline-code" aria-hidden="true">
          {a.iata}
        </span>
        <ArrowUpRight size={19} />
      </div>
      <span className="eyebrow blue">
        {a.country} / {a.icao}
      </span>
      <h2>{a.nameZh}</h2>
      <p className="airline-en">{a.nameEn}</p>
      <div className="tag-row">
        <span>{a.headquarters}</span>
        <span>{a.alliance}</span>
      </div>
    </Link>
  );
}
export function AirlineBrowser() {
  const [query, setQuery] = useState("");
  const [alliance, setAlliance] = useState("");
  const filtered = airlines.filter(
    (a) =>
      (!alliance || a.alliance === alliance) &&
      [a.nameZh, a.nameEn, a.country, a.headquarters, a.iata, a.icao]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="airline-tools">
        <label className="airline-search">
          <Search size={18} />
          <span className="sr-only">搜索航空公司</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="名称、国家、城市或航司代码"
          />
        </label>
        <label>
          <span className="sr-only">按航空联盟筛选</span>
          <select
            value={alliance}
            onChange={(e) => setAlliance(e.target.value)}
          >
            <option value="">全部航空联盟</option>
            {[...new Set(airlines.map((a) => a.alliance))].map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="muted" role="status">
        {filtered.length} 家航空公司
      </p>
      <div className="atlas-grid">
        {filtered.map((a) => (
          <AirlineCard key={a.slug} airline={a} />
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <h2>暂未找到匹配的航司</h2>
          <button
            className="button secondary"
            onClick={() => {
              setQuery("");
              setAlliance("");
            }}
          >
            清除筛选
          </button>
        </div>
      )}
    </>
  );
}
