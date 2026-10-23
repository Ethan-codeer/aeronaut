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
import { questions, Difficulty } from "@/data/questions";
import { playableSpotter, SpotterMode } from "@/data/spotter";
import { airlineQuestions, AirlineMode } from "@/data/airline-questions";
import { ChallengeQuestion, prepareRound } from "@/lib/challenge";
import { scoreAnswers } from "@/lib/science";
import { useProgress } from "./providers";
export function Game({
  kind,
  liveryOnly = false,
}: {
  kind: "quiz" | "spotter" | "airline";
  liveryOnly?: boolean;
}) {
  const { update, ready } = useProgress();
  const [spotterMode, setSpotterMode] = useState<SpotterMode>("standard");
  const [airlineMode, setAirlineMode] = useState<AirlineMode>(
    liveryOnly ? "livery" : "code",
  );
  const [logoVariant, setLogoVariant] = useState<"full" | "detail">("full");
  const [imageAttempt, setImageAttempt] = useState(0);
  const [imageReady, setImageReady] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("入门");
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState<ChallengeQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ correct: boolean }[]>([]);
  const [done, setDone] = useState(false);
  const available = useMemo<ChallengeQuestion[]>(
    () =>
      kind === "quiz"
        ? questions.filter((q) => q.difficulty === difficulty)
        : kind === "spotter"
          ? playableSpotter(spotterMode)
          : airlineQuestions.filter(
              (q) =>
                q.type === airlineMode &&
                (q.type !== "logo" || q.visualVariant === logoVariant) &&
                (!q.image ||
                  (q.imageReviewed && q.imageAnswerLeakRisk === "low")),
            ),
    [kind, difficulty, spotterMode, airlineMode, logoVariant],
  );
  function start() {
    setRound(prepareRound(available));
    setImageReady(false);
    setImageFailed(false);
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setDone(false);
    setStarted(true);
  }
  function answer(choice: number) {
    if (
      selected !== null ||
      imageFailed ||
      (!!round[index].image && !imageReady)
    )
      return;
    setSelected(choice);
  }
  function skipImage() {
    const remaining = round.filter((_, i) => i !== index);
    setImageReady(false);
    setImageFailed(false);
    setSelected(null);
    if (index >= remaining.length) {
      finish(answers);
    } else setRound(remaining);
  }
  function finish(all: { correct: boolean }[]) {
    const score = scoreAnswers(all);
    if (score.total)
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
  }

  function next() {
    const all = [...answers, { correct: selected === round[index].answer }];
    setAnswers(all);
    if (index + 1 === round.length) {
      finish(all);
    } else {
      setImageReady(false);
      setImageFailed(false);
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
          本轮答对 {score.correct} / {score.total} 题
          {score.total > 0 ? " · 成绩已记录到我的机库" : " · 本轮没有有效作答"}
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
          {kind === "quiz"
            ? "READY FOR YOUR NEXT FLIGHT?"
            : kind === "spotter"
              ? "TRAIN YOUR SPOTTER EYES"
              : "AIRLINE CHALLENGE"}
        </span>
        <h2>
          {kind === "quiz"
            ? "选择你的飞行高度"
            : kind === "spotter"
              ? "从一个轮廓，认出一个名字。"
              : "认识连接世界的名字。"}
        </h2>
        <p>
          {kind === "quiz"
            ? "选择答案后查看解析，没有时间限制。"
            : kind === "spotter"
              ? "仅使用通过视觉与授权检查的照片。按照片能支持的精度识别，不凭涂装猜子型号。"
              : "从代码、地理、涂装与标志认识航司。每轮随机抽题，并打乱选项顺序。"}
        </p>
        {kind === "spotter" && (
          <div className="mode-options" role="group" aria-label="识别模式">
            {(
              [
                ["standard", "标准 · Standard"],
                ["detail", "局部 · Detail"],
                ["expert", "专家 · Expert"],
              ] as const
            ).map(([mode, label]) => (
              <button
                key={mode}
                aria-pressed={spotterMode === mode}
                disabled={!playableSpotter(mode).length}
                onClick={() => setSpotterMode(mode)}
              >
                {label}
                <small>
                  {playableSpotter(mode).length
                    ? `${playableSpotter(mode).length} 道已审核`
                    : "素材审核中"}
                </small>
              </button>
            ))}
          </div>
        )}
        {kind === "spotter" && (
          <p className="muted">
            专家模式待补充可可靠区分细微特征的照片；不以模糊图片或无法区分的子型号凑题。
          </p>
        )}
        {kind === "airline" && !liveryOnly && (
          <div className="mode-options" role="group" aria-label="航司挑战模式">
            {(
              [
                ["code", "代码 · Code"],
                ["geography", "地理 · Geography"],
                ["livery", "涂装 · Livery"],
                ["logo", "标志 · Logo"],
              ] as const
            ).map(([mode, label]) => {
              const count = airlineQuestions.filter(
                (q) => q.type === mode,
              ).length;
              return (
                <button
                  key={mode}
                  aria-pressed={airlineMode === mode}
                  disabled={!count}
                  onClick={() => setAirlineMode(mode)}
                >
                  {label}
                  <small>{count ? `${count} 道题` : "授权素材审核中"}</small>
                </button>
              );
            })}
          </div>
        )}
        {kind === "airline" && airlineMode === "logo" && (
          <div className="mode-options" role="group" aria-label="标志难度">
            <button
              aria-pressed={logoVariant === "full"}
              onClick={() => setLogoVariant("full")}
            >
              完整 Logo<small>入门 · 保留真实字标</small>
            </button>
            <button
              aria-pressed={logoVariant === "detail"}
              onClick={() => setLogoVariant("detail")}
            >
              局部 Logo<small>进阶 · 观察图形</small>
            </button>
          </div>
        )}
        {kind === "quiz" && (
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
        <button
          className="button primary"
          onClick={start}
          disabled={!ready || available.length === 0}
        >
          开始挑战 · {Math.min(10, available.length)} 题
          <ArrowRight size={17} />
        </button>
      </div>
    );
  const q = round[index];
  return (
    <div className="game-panel">
      <div className="question-top">
        <span>
          {kind === "quiz"
            ? difficulty + "挑战"
            : kind === "spotter"
              ? "看图识飞机"
              : "航司挑战"}
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
          <div
            className="spotter-image"
            aria-busy={!imageReady && !imageFailed}
          >
            {q.imageView ? (
              <svg
                key={`${q.id}-${imageAttempt}`}
                role="img"
                aria-label="待识别图像的局部"
                viewBox={`${q.imageView.x} ${q.imageView.y} ${q.imageView.width} ${q.imageView.height}`}
              >
                <image
                  href={q.image}
                  width={q.imageView.sourceWidth}
                  height={q.imageView.sourceHeight}
                  onLoad={() => setImageReady(true)}
                  onError={() => setImageFailed(true)}
                />
              </svg>
            ) : (
              <img
                key={`${q.id}-${imageAttempt}`}
                src={q.image}
                alt={
                  kind === "spotter" ? "待识别飞机照片" : "待识别航空公司图像"
                }
                onLoad={() => setImageReady(true)}
                onError={() => setImageFailed(true)}
              />
            )}

            {!imageReady && !imageFailed && (
              <span className="media-loading" role="status">
                正在加载图像…
              </span>
            )}
          </div>
          <p className="image-credit">
            © {q.imageAttribution} ·{" "}
            {q.imageLicenseUrl ? (
              <a href={q.imageLicenseUrl} target="_blank" rel="noreferrer">
                {q.imageLicense}
              </a>
            ) : (
              q.imageLicense
            )}
          </p>
          {imageFailed && (
            <div className="notice" role="alert">
              图片暂时无法加载，本题不计分。
              <button
                className="button secondary"
                onClick={() => {
                  setImageReady(false);
                  setImageFailed(false);
                  setImageAttempt((a) => a + 1);
                }}
              >
                重试图像
              </button>
              <button className="button secondary" onClick={skipImage}>
                跳过此题
              </button>
            </div>
          )}
        </>
      )}
      <h2 className="question-title">{q.question}</h2>
      <div className="answer-options">
        {q.options.map((option, i) => (
          <button
            key={option}
            disabled={
              selected !== null || imageFailed || (!!q.image && !imageReady)
            }
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
            {selected === q.answer ? "回答正确！" : "这次没有选对。"} 正确答案：
            {q.options[q.answer]}
          </b>
          <p>
            你的选择：{q.options[selected]} ·{" "}
            {selected === q.answer ? "正确" : "错误"}
          </p>
          <p>{q.explanation}</p>
          {q.recognition && (
            <ul>
              {q.recognition.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          )}
          {q.confusion && <p>容易混淆：{q.confusion}</p>}
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
        <span>
          本轮{" "}
          {
            scoreAnswers([
              ...answers,
              ...(selected === null
                ? []
                : [{ correct: selected === q.answer }]),
            ]).correct
          }{" "}
          题正确 · 正确率{" "}
          {
            scoreAnswers([
              ...answers,
              ...(selected === null
                ? []
                : [{ correct: selected === q.answer }]),
            ]).accuracy
          }
          %
        </span>
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
