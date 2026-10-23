"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { airports, Airport, regions } from "@/data/airports";
import { shuffled } from "@/lib/challenge";
const AirportMap = dynamic(() => import("./airport-map"), {
  ssr: false,
  loading: () => <p role="status">正在准备挑战地图…</p>,
});
interface Round {
  airport: Airport;
  options: Airport[];
  regionOptions: string[];
}
export function AirportChallenge() {
  const [mode, setMode] = useState("代码猜机场");
  const [round, setRound] = useState<Round[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const done = round.length > 0 && index === round.length;
  const q = round[index];
  function start() {
    setRound(
      shuffled(airports)
        .slice(0, 5)
        .map((a) => ({
          airport: a,
          options: shuffled([
            a,
            ...shuffled(airports.filter((b) => b.slug !== a.slug)).slice(0, 3),
          ]),
          regionOptions: shuffled([
            a.region,
            ...shuffled(regions.filter((r) => r !== a.region)).slice(0, 3),
          ]),
        })),
    );
    setIndex(0);
    setAnswer(null);
    setScore(0);
  }
  const correct = q
    ? mode === "辨认地区"
      ? q.airport.region
      : q.airport.slug
    : "";
  function choose(value: string) {
    if (answer !== null) return;
    setAnswer(value);
    if (value === correct) setScore(score + 1);
  }
  return (
    <div className="paper-panel airport-challenge">
      {!round.length ? (
        <>
          <h2>选择你的地理挑战</h2>
          <div className="mode-options">
            {["代码猜机场", "地图找机场", "辨认地区"].map((m) => (
              <button
                key={m}
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
              >
                {m}
              </button>
            ))}
          </div>
          <p>
            每轮5题，得分仅保留在当前页面。地图找机场可放大聚合点；底图不可用时可改用下方机场选项。
          </p>
          <button className="button primary" onClick={start}>
            开始机场挑战
          </button>
        </>
      ) : done ? (
        <>
          <h2>
            探索完成 · {score} / {round.length}
          </h2>
          <p>正确率 {Math.round((score / round.length) * 100)}%</p>
          <button className="button primary" onClick={() => setRound([])}>
            再探索一次
          </button>
        </>
      ) : (
        <>
          <div className="question-top">
            <span>
              {mode} · {index + 1} / {round.length}
            </span>
            <span role="status">当前得分 {score}</span>
          </div>
          <h2>
            {mode === "代码猜机场"
              ? `IATA 代码 ${q.airport.iata} 对应哪座机场？`
              : mode === "地图找机场"
                ? `在地图上找到：${q.airport.nameZh}`
                : "地图上的机场位于哪个地区？"}
          </h2>
          {mode !== "代码猜机场" && (
            <AirportMap
              key={`${mode}-${index}`}
              items={mode === "地图找机场" ? airports : [q.airport]}
              quiz
              onSelect={mode === "地图找机场" ? choose : undefined}
            />
          )}
          <div className="answer-options">
            {mode === "辨认地区"
              ? q.regionOptions.map((r) => (
                  <button
                    key={r}
                    disabled={answer !== null}
                    onClick={() => choose(r)}
                  >
                    {r}
                  </button>
                ))
              : q.options.map((a) => (
                  <button
                    key={a.slug}
                    disabled={answer !== null}
                    onClick={() => choose(a.slug)}
                  >
                    {a.nameZh}
                  </button>
                ))}
          </div>
          {answer !== null && (
            <div className="answer-explanation" role="status">
              <b>
                {answer === correct ? "回答正确" : "本题未答对"} · 正确答案：
                {q.airport.nameZh} / {q.airport.region}
              </b>
              <p>
                {q.airport.iata} · {q.airport.latitude.toFixed(2)}°,{" "}
                {q.airport.longitude.toFixed(2)}°
              </p>
              <p>{q.airport.fact}</p>
              <Link
                href={`/world/airports/${q.airport.slug}`}
                className="text-link"
              >
                查看机场档案 ↗
              </Link>
            </div>
          )}
          <button
            className="button primary"
            disabled={answer === null}
            onClick={() => {
              setIndex(index + 1);
              setAnswer(null);
            }}
          >
            {index + 1 === round.length ? "查看成绩" : "下一题"}
          </button>
        </>
      )}
    </div>
  );
}
