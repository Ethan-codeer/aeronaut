"use client";
import { useState } from "react";
import Link from "next/link";
import { terms, filterTerms } from "@/data/dictionary";
export function DictionaryBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [letter, setLetter] = useState("全部");
  const results = filterTerms(query, category, letter);
  return (
    <>
      <div className="explore-toolbar">
        <label className="search-field">
          搜索中英文 / 缩写
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例如：升力、ETOPS、Flaps"
          />
        </label>
        <label>
          知识分类
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {["全部", ...new Set(terms.map((t) => t.category))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="letter-index" aria-label="英文首字母索引">
        {["全部", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map((l) => (
          <button
            key={l}
            aria-pressed={l === letter}
            onClick={() => setLetter(l)}
          >
            {l}
          </button>
        ))}
      </div>
      <p className="result-count" role="status">
        找到 {results.length} / {terms.length} 个术语
      </p>
      <div className="explore-grid">
        {results.map((t) => (
          <Link
            className="paper-panel term-card"
            href={`/dictionary/${t.slug}`}
            key={t.slug}
          >
            <span className="eyebrow blue">
              {t.category}
              {t.abbreviation && ` / ${t.abbreviation}`}
            </span>
            <h2>{t.nameZh}</h2>
            <h3>{t.nameEn}</h3>
            <p>{t.definition}</p>
            <span className="text-link">理解这个概念 ↗</span>
          </Link>
        ))}
      </div>
      {!results.length && (
        <div className="notice">
          没有匹配的术语。
          <button
            className="button secondary"
            onClick={() => {
              setQuery("");
              setCategory("全部");
              setLetter("全部");
            }}
          >
            清除筛选
          </button>
        </div>
      )}
    </>
  );
}
