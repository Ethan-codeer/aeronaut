"use client";
import { useState } from "react";
import Link from "next/link";
import {
  liveries,
  getLiveryOrganization,
  getLiveryCountry,
} from "@/data/liveries";
import { airlines, getAirline } from "@/data/airlines";
import { getAircraft } from "@/data/aircraft";
import { LicensedPhoto } from "./licensed-photo";
export function LiveryGallery() {
  const [query, setQuery] = useState("");
  const [era, setEra] = useState("全部");
  const [manufacturer, setManufacturer] = useState("全部");
  const [airline, setAirline] = useState("全部");
  const [country, setCountry] = useState("全部");
  const [category, setCategory] = useState("全部");
  const items = liveries.filter((l) => {
    const a = l.airlineSlug ? getAirline(l.airlineSlug) : undefined;
    const maker =
      l.manufacturer ??
      (l.aircraftSlug ? getAircraft(l.aircraftSlug)?.manufacturer : undefined);
    return (
      (airline === "全部" || l.airlineSlug === airline) &&
      (country === "全部" || getLiveryCountry(l) === country) &&
      (era === "全部" || l.era === era) &&
      (manufacturer === "全部" || maker === manufacturer) &&
      `${l.name} ${l.nameEn ?? ""} ${getLiveryOrganization(l)} ${a?.nameEn ?? ""} ${l.aircraftModel} ${l.design}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()) &&
      (category === "全部" || l.category === category)
    );
  });
  return (
    <>
      <div className="explore-toolbar">
        <label className="search-field">
          中英文搜索
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="涂装、航司或机型"
          />
        </label>
        <label>
          年代
          <select value={era} onChange={(e) => setEra(e.target.value)}>
            {[
              "全部",
              ...new Set(liveries.map((l) => l.era ?? "年代待核实")),
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          飞机制造商
          <select
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
          >
            {[
              "全部",
              ...new Set(
                liveries
                  .map(
                    (l) =>
                      l.manufacturer ??
                      (l.aircraftSlug
                        ? getAircraft(l.aircraftSlug)?.manufacturer
                        : undefined),
                  )
                  .filter((m): m is string => !!m),
              ),
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          航空公司
          <select value={airline} onChange={(e) => setAirline(e.target.value)}>
            <option value="全部">全部</option>
            {airlines
              .filter((a) => liveries.some((l) => l.airlineSlug === a.slug))
              .map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.nameZh}
                </option>
              ))}
          </select>
        </label>
        <label>
          国家与地区
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            {["全部", ...new Set(liveries.map(getLiveryCountry))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          涂装分类
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {["全部", ...new Set(liveries.map((l) => l.category))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="result-count" role="status">
        {items.length} / {liveries.length} 件视觉档案
      </p>
      <div className="explore-grid">
        {items.map((l) => (
          <article className="livery-card" key={l.slug}>
            <LicensedPhoto
              media={l.media}
              alt={`${getLiveryOrganization(l)} ${l.name}代表图片`}
            />
            <div className="livery-card-body">
              <span className="eyebrow blue">
                {l.category} / {getLiveryOrganization(l)}
              </span>
              <h2>
                <Link href={`/world/liveries/${l.slug}`}>{l.name}</Link>
              </h2>
              <p>{l.aircraftModel}</p>
              <p>{l.design}</p>
              <Link className="text-link" href={`/world/liveries/${l.slug}`}>
                走进设计背后的故事 ↗
              </Link>
            </div>
          </article>
        ))}
      </div>
      {!items.length && (
        <div className="notice">
          暂无符合筛选的档案。
          <button
            className="button secondary"
            onClick={() => {
              setAirline("全部");
              setCountry("全部");
              setCategory("全部");
              setQuery("");
              setEra("全部");
              setManufacturer("全部");
            }}
          >
            重置筛选
          </button>
        </div>
      )}
    </>
  );
}
