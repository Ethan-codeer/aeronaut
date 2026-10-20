"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  ExternalLink,
} from "lucide-react";
import { questions, spotterQuestions, Difficulty } from "@/data/questions";
import { getAircraft } from "@/data/aircraft";
import { scoreAnswers } from "@/lib/science";
import { useProgress } from "./providers";
import { SafeImage } from "./ui";
interface GameQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  link: string;
  source?: string;
  image?: string;
  clue?: string;
  credit?: string;
  imageSource?: string;
}
export function Game({
  kind,
  review = false,
}: {
  kind: "quiz" | "spotter";
  review?: boolean;
}) {
  const { progress, update, ready } = useProgress();
  const [difficulty, setDifficulty] = useState<Difficulty>("入门");
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState<GameQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ correct: boolean }[]>([]);
  const [done, setDone] = useState(false);
  const available = useMemo<GameQuestion[]>(
    () =>
      kind === "quiz"
        ? questions.filter((q) =>
            review
              ? progress.wrong.includes(q.id)
              : q.difficulty === difficulty,
          )
        : spotterQuestions.map((q) => {
            const a = getAircraft(q.aircraftSlug)!;
            return {
              id: q.id,
              question: "这架飞机是哪一个型号？",
              options: q.options,
              answer: q.options.indexOf(a.model),
              explanation: q.explanation,
              link: `/atlas/${a.slug}`,
              image: a.image,
              credit: a.imageCredit,
              imageSource: a.imageSource,
              clue: a.recognition.slice(0, 2).join("；"),
            };
          }),
    [kind, review, progress.wrong, difficulty],
  );
  function start() {
    setRound(available);
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setDone(false);
    setStarted(true);
  }
  function answer(choice: number) {
    if (selected !== null) return;
    setSelected(choice);
    const q = round[index];
    if (kind === "quiz")
      update((p) => ({
        ...p,
        wrong:
          choice !== q.answer
            ? [...new Set([...p.wrong, q.id])]
            : p.wrong.filter((id) => id !== q.id),
      }));
  }
  function next() {
    const all = [...answers, { correct: selected === round[index].answer }];
    setAnswers(all);
    if (index + 1 === round.length) {
      const score = scoreAnswers(all);
      update((p) => ({
        ...p,
        results: [
          {
            id:
              globalThis.crypto?.randomUUID?.() ??
              `result-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            kind,
            date: new Date().toISOString(),
            correct: score.correct,
            total: score.total,
          },
          ...p.results,
        ].slice(0, 1000),
      }));
      setDone(true);
    } else {
      setIndex(index + 1);
      setSelected(null);
    }
  }
  const score = scoreAnswers(answers);
  if (done)
    return (
      <div className="game-panel result-panel">
        <span className="result-icon">
          <Trophy size={50} />
        </span>
        <span className="eyebrow blue">FLIGHT COMPLETE</span>
        <h2>
          {score.accuracy >= 80
            ? "漂亮的一次着陆！"
            : "每一次探索，都离天空更近。"}
        </h2>
        <div className="result-score">
          {score.accuracy}
          <small>%</small>
        </div>
        <p>
          本轮答对 {score.correct} / {score.total} 题 · 成绩已记录到我的机库
        </p>
        <div className="button-row">
          <button
            className="button primary"
            onClick={() => {
              setStarted(false);
              setDone(false);
            }}
          >
            <RotateCcw size={17} />
            再来一轮
          </button>
          <Link href="/hangar" className="button secondary">
            查看我的机库
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    );
  if (!started)
    return (
      <div className="game-panel game-start">
        <span className="eyebrow blue">
          {review
            ? "WRONG ANSWER REVIEW"
            : kind === "quiz"
              ? "READY FOR YOUR NEXT FLIGHT?"
              : "TRAIN YOUR SPOTTER EYES"}
        </span>
        <h2>
          {review
            ? "把错过的知识，再认识一次。"
            : kind === "quiz"
              ? "选择你的飞行高度"
              : "从一个轮廓，认出一个名字。"}
        </h2>
        <p>
          {kind === "quiz"
            ? "选择答案后查看解析，点击下一题继续。没有时间限制。"
            : "本轮共 11 题。使用已核对型号的授权照片与外形线索；暂无照片的机型使用明确标注的原创示意图。"}
        </p>
        {kind === "quiz" && !review && (
          <div
            className="difficulty-options"
            role="group"
            aria-label="选择难度"
          >
            {(["入门", "进阶", "专家"] as Difficulty[]).map((d, i) => (
              <button
                className={d === difficulty ? "selected" : ""}
                onClick={() => setDifficulty(d)}
                key={d}
              >
                <span>LEVEL 0{i + 1}</span>
                <b>{d}</b>
                <small>{["认识天空", "探索细节", "专业挑战"][i]}</small>
              </button>
            ))}
          </div>
        )}
        {review && (
          <p>本地待复习错题：{available.length} 道。答对后会移出错题本。</p>
        )}
        <button
          className="button primary"
          onClick={start}
          disabled={!ready || available.length === 0}
        >
          开始{review ? "复习" : "挑战"} · {available.length} 题
          <ArrowRight size={17} />
        </button>
        {review && available.length === 0 && (
          <Link href="/academy/quiz" className="text-link">
            去完成一次知识挑战
            <ArrowRight size={16} />
          </Link>
        )}
      </div>
    );
  const q = round[index];
  return (
    <div className="game-panel">
      <div className="question-top">
        <span>
          {kind === "quiz"
            ? review
              ? "错题复习"
              : difficulty + "挑战"
            : "看图识飞机"}
        </span>
        <span>
          QUESTION <b>{String(index + 1).padStart(2, "0")}</b> / {round.length}
        </span>
      </div>
      <div className="progress-track">
        <span style={{ width: `${((index + 1) / round.length) * 100}%` }} />
      </div>
      {q.image && (
        <>
          <div className="spotter-image">
            <SafeImage
              src={q.image}
              alt="待识别飞机图像，请结合下方外形线索作答"
            />
            <span>
              {q.imageSource
                ? `© ${q.credit}`
                : "ORIGINAL AIRCRAFT ILLUSTRATION"}
            </span>
          </div>
          <p className="clue">观察线索：{q.clue}</p>
        </>
      )}
      <h2 className="question-title">{q.question}</h2>
      <div className="answer-options">
        {q.options.map((option, i) => (
          <button
            key={option}
            disabled={selected !== null}
            onClick={() => answer(i)}
            className={
              selected !== null
                ? i === q.answer
                  ? "correct"
                  : i === selected
                    ? "incorrect"
                    : ""
                : ""
            }
          >
            <span>{String.fromCharCode(65 + i)}</span>
            {option}
            {selected !== null && i === q.answer && <CheckCircle2 size={20} />}
            {selected === i && i !== q.answer && <XCircle size={20} />}
          </button>
        ))}
      </div>
      {selected !== null && (
        <div
          className={`answer-explanation ${selected === q.answer ? "success" : "failure"}`}
          aria-live="polite"
        >
          <b>
            {selected === q.answer
              ? "回答正确，继续保持！"
              : `正确答案：${q.options[q.answer]}`}
          </b>
          <p>{q.explanation}</p>
          {q.imageSource && (
            <a
              href={q.imageSource}
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              照片与授权来源 ↗
            </a>
          )}
          <div className="button-row">
            <Link className="text-link" href={q.link}>
              延伸阅读
              <ExternalLink size={14} />
            </Link>
            {q.source && (
              <a
                className="text-link"
                href={q.source}
                target="_blank"
                rel="noreferrer"
              >
                资料来源
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      )}
      <div className="question-bottom">
        <span>认真思考，比快速回答更重要。</span>
        <button
          className="button primary"
          disabled={selected === null}
          onClick={next}
        >
          {index + 1 === round.length ? "查看成绩" : "下一题"}
          <ArrowRight size={17} />
        </button>
      </div>
    </div>
  );
}
