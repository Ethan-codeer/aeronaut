"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, ArrowLeftRight, X } from "lucide-react";
import { aircraft } from "@/data/aircraft";
import { AircraftCard } from "./ui";
export function AtlasBrowser() {
  const [search, setSearch] = useState("");
  const [manufacturer, setManufacturer] = useState("全部制造商");
  const [category, setCategory] = useState("全部机型");
  const filtered = aircraft.filter(
    (a) =>
      `${a.model} ${a.manufacturer} ${a.intro}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (manufacturer === "全部制造商" || manufacturer === a.manufacturer) &&
      (category === "全部机型" || category === a.category),
  );
  return (
    <>
      <div className="filter-bar">
        <label className="search-field">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索机型、制造商或关键词…"
            aria-label="搜索机型"
          />
          {search && (
            <button
              className="icon-btn"
              onClick={() => setSearch("")}
              aria-label="清空搜索"
            >
              <X size={15} />
            </button>
          )}
        </label>
        <label className="select-field">
          <SlidersHorizontal size={16} />
          <select
            aria-label="制造商筛选"
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
          >
            {["全部制造商", "Airbus", "Boeing", "Embraer", "COMAC"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <select
          className="standalone-select"
          aria-label="机型类别筛选"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {["全部机型", "窄体客机", "宽体客机", "支线客机"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <Link className="button secondary" href="/atlas/compare">
          <ArrowLeftRight size={17} />
          机型比较
        </Link>
      </div>
      <div className="results-label" aria-live="polite">
        已找到 <b>{filtered.length}</b> 个机型{" "}
        <span>授权摄影与原创图 · 数据可溯源</span>
      </div>
      {filtered.length ? (
        <div className="atlas-grid">
          {filtered.map((a) => (
            <AircraftCard key={a.id} aircraft={a} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search size={35} />
          <h2>暂未找到这架飞机</h2>
          <p>试试其他关键词，或清除筛选。</p>
          <button
            className="button primary"
            onClick={() => {
              setSearch("");
              setManufacturer("全部制造商");
              setCategory("全部机型");
            }}
          >
            重置筛选
          </button>
        </div>
      )}
    </>
  );
}
