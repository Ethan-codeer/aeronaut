"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import {
  Download,
  Upload,
  Heart,
  Plane,
  BookOpen,
  Trophy,
  FlaskConical,
  Target,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { aircraft } from "@/data/aircraft";
import { questions } from "@/data/questions";
import { useProgress } from "./providers";
import { AircraftCard } from "./ui";
export function Hangar() {
  const { progress, ready, error, importData } = useProgress();
  const input = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const favorites = aircraft.filter((a) => progress.favorites.includes(a.slug));
  const wrong = questions.filter((q) => progress.wrong.includes(q.id));
  const achievements = [
    {
      name: "初次相遇",
      description: "探索 1 架飞机的档案",
      unlocked: progress.visited.length > 0,
      icon: Plane,
    },
    {
      name: "机库收藏家",
      description: "收藏 3 架飞机",
      unlocked: progress.favorites.length >= 3,
      icon: Heart,
    },
    {
      name: "知识起飞",
      description: "完成一轮航空挑战",
      unlocked: progress.results.length > 0,
      icon: BookOpen,
    },
    {
      name: "天空学者",
      description: "一轮测验正确率达 80%",
      unlocked: progress.results.some((r) => r.correct / r.total >= 0.8),
      icon: Trophy,
    },
    {
      name: "科学探索者",
      description: "亲手调整升力实验参数",
      unlocked: progress.labUsed,
      icon: FlaskConical,
    },
  ];
  function download() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(progress, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `aeronaut-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("备份已导出。请保留 JSON 文件以便恢复。");
  }
  async function choose(file: File | undefined) {
    if (!file) return;
    if (file.size > 2_000_000) {
      setMessage("文件过大，请选择小于 2 MB 的备份。");
      return;
    }
    try {
      const raw = await file.text();
      const { parseProgress } = await import("@/lib/progress");
      parseProgress(raw);
      setPending(raw);
      setMessage("备份格式检查通过。确认导入会替换当前本地进度。");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "无法读取备份文件");
    }
    if (input.current) input.current.value = "";
  }
  if (!ready)
    return (
      <div className="notice" role="status">
        正在打开你的机库…
      </div>
    );
  return (
    <>
      {error && (
        <div role="alert" className="notice">
          {error}
        </div>
      )}
      <div className="hangar-top">
        <span>
          <ShieldCheck size={18} />
          只保存在此浏览器，无需账号
        </span>
        <div className="button-row">
          <button className="button secondary" onClick={download}>
            <Download size={16} />
            导出备份
          </button>
          <button
            className="button secondary"
            onClick={() => input.current?.click()}
          >
            <Upload size={16} />
            导入记录
          </button>
          <input
            className="sr-only"
            type="file"
            accept="application/json,.json"
            ref={input}
            onChange={(e) => void choose(e.target.files?.[0])}
            aria-label="选择机库备份文件"
          />
        </div>
      </div>
      {message && (
        <div className="notice" role="status">
          {message}
          {pending && (
            <div className="button-row">
              <button
                className="button primary"
                onClick={() => {
                  try {
                    importData(pending);
                    setPending(null);
                    setMessage("导入成功，你的探索记录已恢复。");
                  } catch {
                    setMessage("导入失败，请检查备份。");
                  }
                }}
              >
                确认替换并导入
              </button>
              <button
                className="button secondary"
                onClick={() => {
                  setPending(null);
                  setMessage("已取消导入。");
                }}
              >
                取消
              </button>
            </div>
          )}
        </div>
      )}
      <div className="stats-grid">
        {[
          {
            label: "探索过的机型",
            value: progress.visited.length,
            icon: Plane,
          },
          { label: "收藏的飞机", value: favorites.length, icon: Heart },
          { label: "完成的挑战", value: progress.results.length, icon: Target },
          {
            label: "解锁的成就",
            value: achievements.filter((a) => a.unlocked).length,
            icon: Trophy,
          },
        ].map((x) => (
          <div className="stat-card" key={x.label}>
            <x.icon size={23} />
            <b>{String(x.value).padStart(2, "0")}</b>
            <span>{x.label}</span>
          </div>
        ))}
      </div>
      <section className="hangar-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow blue">MY COLLECTION</span>
            <h2>我的收藏</h2>
          </div>
          <Link href="/atlas" className="text-link">
            继续探索
            <ArrowRight size={16} />
          </Link>
        </div>
        {favorites.length ? (
          <div className="atlas-grid">
            {favorites.map((a) => (
              <AircraftCard key={a.id} aircraft={a} />
            ))}
          </div>
        ) : (
          <div className="empty-state compact">
            <Heart size={30} />
            <h3>你的第一架收藏，会是谁？</h3>
            <p>点击飞机卡片上的爱心，将它停入你的机库。</p>
            <Link className="button primary" href="/atlas">
              去发现一架飞机
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>
      <section className="hangar-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow blue">MILESTONES</span>
            <h2>探索成就</h2>
          </div>
        </div>
        <div className="achievements">
          {achievements.map((a) => (
            <div
              className={a.unlocked ? "achievement unlocked" : "achievement"}
              key={a.name}
            >
              <span>
                <a.icon size={27} />
              </span>
              <h3>{a.name}</h3>
              <p>{a.description}</p>
              <small>{a.unlocked ? "已解锁" : "等待解锁"}</small>
            </div>
          ))}
        </div>
      </section>
      <div className="two-columns">
        <section className="paper-panel">
          <span className="eyebrow blue">FLIGHT LOG</span>
          <h2>挑战飞行日志</h2>
          {progress.results.length ? (
            <div className="result-list">
              {progress.results.slice(0, 15).map((r) => (
                <div key={r.id}>
                  <div>
                    <b>{r.kind === "quiz" ? "航空知识问答" : "看图识飞机"}</b>
                    <span>
                      {new Date(r.date).toLocaleDateString("zh-CN", {
                        timeZone: "UTC",
                      })}
                    </span>
                  </div>
                  <strong>
                    {r.correct}/{r.total}
                    <small>{Math.round((r.correct / r.total) * 100)}%</small>
                  </strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">
              还没有完成的挑战。第一次起飞，就从今天开始。
            </p>
          )}
          <Link href="/academy" className="text-link">
            前往挑战大厅
            <ArrowRight size={16} />
          </Link>
        </section>
        <section className="paper-panel">
          <span className="eyebrow blue">LEARN FROM EVERY FLIGHT</span>
          <h2>
            错题复习本 <span className="count-badge">{wrong.length}</span>
          </h2>
          {wrong.length ? (
            <>
              <ul className="wrong-list">
                {wrong.slice(0, 6).map((q) => (
                  <li key={q.id}>{q.question}</li>
                ))}
              </ul>
              <Link className="button primary" href="/academy/quiz?mode=wrong">
                开始复习
                <ArrowRight size={16} />
              </Link>
            </>
          ) : (
            <>
              <p className="muted">
                当前没有待复习错题。答错的题目会自动出现在这里，复习答对后移出。
              </p>
              <Link href="/academy/quiz" className="text-link">
                挑战一下
                <ArrowRight size={16} />
              </Link>
            </>
          )}
        </section>
      </div>
    </>
  );
}
