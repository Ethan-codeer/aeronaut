"use client";
import { useState } from "react";
import Link from "next/link";
import { cockpitQuestions, CockpitQuestion } from "@/data/cockpit";
import { prepareRound } from "@/lib/challenge";
import { InstrumentPanel } from "./instruments";
export function CockpitChallenge() {
  const [difficulty, setDifficulty] = useState("入门");
  const [round, setRound] = useState<CockpitQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const q = round[index];
  const done = round.length > 0 && index === round.length;
  function start() {
    setRound(
      prepareRound(
        cockpitQuestions.filter((q) => q.difficulty === difficulty),
        10,
      ),
    );
    setIndex(0);
    setChoice(null);
    setScore(0);
  }
  return (
    <>
      <div className="notice">
        教学模拟 · 不用于真实飞行训练。仅显示本轮得分，不保存逐题作答记录。
      </div>
      {!round.length ? (
        <div className="paper-panel reading-panel">
          <h2>先读姿态，再读趋势。</h2>
          <p>25 道题，按难度抽取，每轮最多10题；回答后显示解析。</p>
          <label>
            挑战难度
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              {["入门", "进阶", "专家"].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <button className="button primary" onClick={start}>
            开始仪表挑战
          </button>
          <Link href="/lab/instruments" className="text-link">
            先学习仪表与刻度约定 ↗
          </Link>
        </div>
      ) : done ? (
        <div className="game-panel result-panel">
          <h2>本轮完成</h2>
          <p className="result-score">
            {score} / {round.length}
          </p>
          <p>正确率 {Math.round((score / round.length) * 100)}%</p>
          <button className="button primary" onClick={() => setRound([])}>
            再来一轮
          </button>
        </div>
      ) : (
        <div className="paper-panel cockpit-question">
          <div className="question-top">
            <span>
              {q.difficulty} · QUESTION {index + 1} / {round.length}
            </span>
            <span role="status">当前得分 {score}</span>
          </div>
          <InstrumentPanel state={q.state} kinds={q.kinds} readout={false} />
          {q.kinds.includes("altitude") && (
            <p className="altitude-window">
              高度表数字窗：{q.state.altitude.toLocaleString()} ft
            </p>
          )}
          <h2>{q.question}</h2>
          <div className="answer-options">
            {q.options.map((o, i) => (
              <button
                key={o}
                disabled={choice !== null}
                className={
                  choice !== null
                    ? i === q.answer
                      ? "correct"
                      : i === choice
                        ? "incorrect"
                        : ""
                    : ""
                }
                onClick={() => {
                  if (choice === null) {
                    setChoice(i);
                    if (i === q.answer) setScore(score + 1);
                  }
                }}
              >
                {o}
              </button>
            ))}
          </div>
          {choice !== null && (
            <div className="answer-explanation" role="status">
              <b>
                {choice === q.answer ? "回答正确" : "本题未答对"} · 正确答案：
                {q.options[q.answer]}
              </b>
              <p>{q.explanation}</p>
              <Link className="text-link" href={q.link}>
                查阅相关术语 ↗
              </Link>
            </div>
          )}
          <div className="question-bottom">
            <Link href="/lab/instruments">刻度约定 ↗</Link>
            <button
              className="button primary"
              disabled={choice === null}
              onClick={() => {
                setIndex(index + 1);
                setChoice(null);
              }}
            >
              {index + 1 === round.length ? "查看成绩" : "下一题"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
