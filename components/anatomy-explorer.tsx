"use client";
import { useState } from "react";
import Link from "next/link";
import { anatomyParts } from "@/data/anatomy";
type PartId = (typeof anatomyParts)[number]["id"];
export function AnatomyExplorer() {
  const [selected, setSelected] = useState<PartId>("wing");
  const p = anatomyParts.find((p) => p.id === selected)!;
  function attrs(id: PartId) {
    return {
      role: "button",
      tabIndex: 0,
      "aria-label": anatomyParts.find((p) => p.id === id)!.name,
      "aria-pressed": selected === id,
      onClick: () => setSelected(id),
      onKeyDown: (e: React.KeyboardEvent<SVGGElement>) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setSelected(id);
        }
      },
      className: `anatomy-part ${selected === id ? "selected" : ""}`,
    };
  }
  return (
    <>
      <div className="anatomy-layout">
        <div className="paper-panel anatomy-canvas">
          <div className="instrument-caption">
            <span className="eyebrow blue">TWINJET / 典型双发客机</span>
            <span>俯视 · 机头朝上 ↑</span>
          </div>
          <svg
            viewBox="0 0 720 640"
            className="airframe-svg"
            aria-label="可交互双发客机结构示意图"
          >
            <g fill="none" stroke="var(--line)">
              <path d="M350 20V620M20 320H580" strokeDasharray="5 8" />
              <circle cx="350" cy="320" r="250" />
            </g>
            <g {...attrs("horizontal")}>
              <path d="M334 485L200 565 205 587 345 555H355L495 587 500 565 366 485Z" />
            </g>
            <g {...attrs("wing")}>
              <path d="M330 255L60 440 60 475 331 390H369L640 475 640 440 370 255Z" />
            </g>
            <g {...attrs("engine")}>
              <path d="M201 305Q220 291 239 305L235 402Q220 413 205 402Z M461 305Q480 291 499 305L495 402Q480 413 465 402Z" />
              <path d="M202 313H238M462 313H498" />
            </g>
            <g {...attrs("body")}>
              <path d="M350 35C319 45 326 140 325 215L326 463Q331 544 350 580Q369 544 374 463L375 215C374 140 381 45 350 35Z" />
              <path
                d="M334 95Q350 81 366 95L365 106Q350 99 335 106Z"
                fill="#23455d"
              />
            </g>
            <g {...attrs("vertical")}>
              <path d="M344 450L350 403 356 450 354 568H346Z" />
            </g>
            <g {...attrs("highlift")}>
              <path d="M246 408L318 385 319 405 254 427Z M382 385L454 408 446 427 381 405Z M93 419L252 310 256 320 98 429Z M448 310L607 419 602 429 444 320Z" />
            </g>
            <g {...attrs("aileron")}>
              <path d="M77 461L173 431 184 447 78 480Z M527 431L623 461 622 480 516 447Z" />
            </g>
            <g {...attrs("gear")} strokeDasharray="4 3">
              <path d="M343 150H357V190H343Z M296 359H315V403H296Z M385 359H404V403H385Z" />
            </g>
            <g fontSize="12" fill="var(--muted)">
              <text x="36" y="510">
                外翼后缘 · 副翼
              </text>
              <text x="420" y="295">
                前缘 · 缝翼
              </text>
              <text x="410" y="450">
                内侧后缘 · 襟翼
              </text>
              <text x="470" y="185">
                侧视 / 起落架放下
              </text>
            </g>
            <g transform="translate(460 80) scale(.7)">
              <g {...attrs("body")}>
                <path d="M0 79Q-10 70 7 60L210 60 240 48 243 65 219 83H0Z" />
                <path d="M3 62H20L28 68H0" />
              </g>
              <g {...attrs("vertical")}>
                <path d="M196 60L218 0H230L228 62Z" />
              </g>
              <g {...attrs("gear")}>
                <path d="M28 82V104M133 82V104" />
                <circle cx="28" cy="108" r="10" />
                <circle cx="133" cy="108" r="12" />
              </g>
            </g>
          </svg>
          <p>教学示意 · 非特定机型、非维修图纸。虚线起落架位于机腹下方。</p>
        </div>
        <aside className="paper-panel anatomy-info" aria-live="polite">
          <span className="eyebrow blue">
            {String(anatomyParts.indexOf(p) + 1).padStart(2, "0")} / 08
          </span>
          <h2>{p.name}</h2>
          <p className="term-en">{p.en}</p>
          <h3>它的任务</h3>
          <p>{p.function}</p>
          <h3>为什么这样工作</h3>
          <p>{p.principle}</p>
          {["wing", "engine", "aileron", "highlift"].includes(selected) && (
            <ConceptAnimation part={selected} />
          )}
          <p className="small-copy">{p.detail}</p>
          <div className="related-links">
            <Link href={`/dictionary/${p.term}`}>查阅中英文术语 ↗</Link>
            <Link href={p.link}>{p.label} ↗</Link>
            <Link href="/atlas/a320neo">认识一种典型双发客机 ↗</Link>
          </div>
        </aside>
      </div>
      <div className="part-buttons" aria-label="选择飞机部件">
        {anatomyParts.map((part, i) => (
          <button
            className={part.id === selected ? "active" : ""}
            aria-pressed={part.id === selected}
            key={part.id}
            onClick={() => setSelected(part.id)}
          >
            <span>0{i + 1}</span>
            {part.name}
            <small>{part.en}</small>
          </button>
        ))}
      </div>
    </>
  );
}
function ConceptAnimation({ part }: { part: PartId }) {
  return (
    <svg
      className="concept-animation"
      viewBox="0 0 320 115"
      role="img"
      aria-label={
        part === "engine"
          ? "涡扇发动机核心机与旁通气流示意"
          : part === "aileron"
            ? "左右机翼升力差示意"
            : "机翼周围气流概念示意"
      }
    >
      {part === "engine" ? (
        <>
          <path
            d="M25 25Q70 5 270 25V90Q70 110 25 90Z"
            fill="#90bad033"
            stroke="#7099b1"
          />
          <path d="M70 43H170L210 58 170 73H70Z" fill="#b6bdc5" />
          <path d="M150 43V73M170 45V71" stroke="#ed925c" strokeWidth="10" />
          <path d="M40 29V87" stroke="#2487c8" strokeWidth="7" />
          <path
            className="flow-dash"
            d="M0 24H310M0 92H310"
            stroke="#2487c8"
            strokeWidth="3"
            strokeDasharray="14 10"
          />
          <text x="65" y="61" fontSize="11">
            压缩 → 燃烧 → 涡轮
          </text>
          <text x="105" y="16" fontSize="10">
            旁通气流 →
          </text>
        </>
      ) : part === "aileron" ? (
        <>
          <path d="M20 70H300" stroke="#779ab0" strokeWidth="12" />
          <path
            d="M65 55V35M65 35L56 44M65 35L74 44M255 55V10M255 10L246 19M255 10L264 19"
            stroke="#2487c8"
            fill="none"
            strokeWidth="3"
          />
          <text x="20" y="104" fontSize="12">
            左侧升力减小 ← 向左滚转
          </text>
        </>
      ) : (
        <>
          <path d="M35 73Q135 15 270 69Q160 85 35 73" fill="#7dabc9" />
          <path
            className="flow-dash"
            d="M0 40Q105 0 185 25T320 40M0 92H320"
            fill="none"
            stroke="#2487c8"
            strokeWidth="2"
            strokeDasharray="14 9"
          />
          <text x="9" y="111" fontSize="10">
            相对气流 → · 概念示意
          </text>
        </>
      )}
    </svg>
  );
}
