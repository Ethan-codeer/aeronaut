"use client";
import { useState } from "react";
import Link from "next/link";
import { liveries } from "@/data/liveries";
import { airlines, getAirline } from "@/data/airlines";
import { LicensedPhoto } from "./licensed-photo";
export function LiveryGallery() {
  const [airline, setAirline] = useState("全部");
  const [country, setCountry] = useState("全部");
  const [category, setCategory] = useState("全部");
  const items = liveries.filter((l) => {
    const a = getAirline(l.airlineSlug)!;
    return (
      (airline === "全部" || l.airlineSlug === airline) &&
      (country === "全部" || a.country === country) &&
      (category === "全部" || l.category === category)
    );
  });
  return (
    <>
      <div className="explore-toolbar">
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
            {[
              "全部",
              ...new Set(
                airlines
                  .filter((a) => liveries.some((l) => l.airlineSlug === a.slug))
                  .map((a) => a.country),
              ),
            ].map((c) => (
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
            {["全部", "经典涂装", "纪念涂装", "特别涂装", "历史涂装"].map(
              (c) => (
                <option key={c}>{c}</option>
              ),
            )}
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
              alt={`${getAirline(l.airlineSlug)!.nameZh} ${l.name}真实航空照片`}
            />
            <div className="livery-card-body">
              <span className="eyebrow blue">
                {l.category} / {getAirline(l.airlineSlug)!.nameZh}
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
            }}
          >
            重置筛选
          </button>
        </div>
      )}
    </>
  );
}
