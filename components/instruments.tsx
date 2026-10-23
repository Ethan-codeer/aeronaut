"use client";
import { useState } from "react";
import Link from "next/link";
import {
  FlightState,
  initialFlight,
  normalizeHeading,
  airspeedAngle,
  vsiAngle,
  altimeterAngles,
} from "@/lib/instruments";
export type InstrumentKind =
  "attitude" | "airspeed" | "altitude" | "vsi" | "heading";
const descriptions = {
  attitude: "显示相对地平线的俯仰与横滚；不能据此单独判断爬升。",
  airspeed: "显示指示空速IAS；与真空速、地速不同。",
  altitude: "显示选定气压基准下的指示高度；不是距地高度。",
  vsi: "显示指示高度的变化率；正值爬升、负值下降。",
  heading: "显示机头相对磁北的指向；不代表地面航迹。",
};
const labels = {
  attitude: ["姿态仪", "Attitude Indicator", "attitude-indicator"],
  airspeed: ["空速表", "Airspeed Indicator", "airspeed-indicator"],
  altitude: ["高度表", "Altimeter", "altimeter"],
  vsi: ["垂直速度表", "Vertical Speed Indicator", "vsi"],
  heading: ["航向指示器", "Heading Indicator", "heading-indicator"],
};
function point(angle: number, r = 75) {
  const a = (angle * Math.PI) / 180;
  return { x: 100 + Math.sin(a) * r, y: 100 - Math.cos(a) * r };
}
function Needle({
  angle,
  length = 65,
  color = "#fafaf4",
}: {
  angle: number;
  length?: number;
  color?: string;
}) {
  return (
    <path
      className="gauge-needle"
      d={`M97 114L100 ${100 - length}L103 114Z`}
      fill={color}
      transform={`rotate(${angle} 100 100)`}
    />
  );
}
export function Instrument({
  kind,
  state,
  readout = true,
}: {
  kind: InstrumentKind;
  state: FlightState;
  readout?: boolean;
}) {
  const label = labels[kind];
  const angles = altimeterAngles(state.altitude);
  const accessible =
    kind === "attitude"
      ? `俯仰${state.pitch}度，横滚${state.roll}度，右正左负`
      : kind === "airspeed"
        ? `${state.airspeed}节`
        : kind === "altitude"
          ? `${state.altitude}英尺`
          : kind === "vsi"
            ? `${state.verticalSpeed}英尺每分钟`
            : `${normalizeHeading(state.heading)}度`;
  return (
    <figure className="instrument">
      <svg
        viewBox="0 0 200 200"
        role="img"
        aria-label={`${label[0]}，${accessible}`}
      >
        <defs>
          <clipPath id={`clip-${kind}`}>
            <circle cx="100" cy="100" r="85" />
          </clipPath>
        </defs>
        <circle
          cx="100"
          cy="100"
          r="98"
          fill="#142331"
          stroke="#425566"
          strokeWidth="3"
        />
        {kind === "attitude" ? (
          <>
            <g clipPath={`url(#clip-${kind})`}>
              <g transform={`rotate(${-state.roll} 100 100)`}>
                <g transform={`translate(0 ${state.pitch * 2})`}>
                  <path d="M-100-150H300V100H-100Z" fill="#439bd3" />
                  <path d="M-100 100H300V350H-100Z" fill="#947044" />
                  <path d="M-100 100H300" stroke="white" strokeWidth="2" />
                  {[-30, -20, -10, 10, 20, 30].map((n) => (
                    <g key={n}>
                      <path
                        d={`M${n % 20 === 0 ? 72 : 82} ${100 - n * 2}H${n % 20 === 0 ? 128 : 118}`}
                        stroke="white"
                      />
                      <text x="136" y={104 - n * 2} fill="white" fontSize="9">
                        {Math.abs(n)}
                      </text>
                    </g>
                  ))}
                </g>
              </g>
            </g>
            {[-60, -30, -20, -10, 0, 10, 20, 30, 60].map((a) => {
              const s = point(a, 82),
                e = point(a, 89);
              return (
                <path
                  key={a}
                  d={`M${s.x} ${s.y}L${e.x} ${e.y}`}
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
            <path
              d="M43 100H78L84 108H116L122 100H157M100 92V104"
              stroke="#ffdb76"
              strokeWidth="4"
              fill="none"
            />
            <path
              d="M95 25L100 16 105 25Z"
              fill="#ffdb76"
              transform={`rotate(${-state.roll} 100 100)`}
            />
          </>
        ) : kind === "heading" ? (
          <>
            <g transform={`rotate(${-state.heading} 100 100)`}>
              {Array.from({ length: 36 }, (_, i) => {
                const a = i * 10,
                  s = point(a, 76),
                  e = point(a, 86),
                  t = point(a, 62);
                return (
                  <g key={a}>
                    <path d={`M${s.x} ${s.y}L${e.x} ${e.y}`} stroke="white" />
                    <text
                      x={t.x}
                      y={t.y + 4}
                      transform={`rotate(${a} ${t.x} ${t.y})`}
                      textAnchor="middle"
                      fill="white"
                      fontSize="12"
                    >
                      {a % 90 === 0
                        ? ["N", "E", "S", "W"][a / 90]
                        : a % 30 === 0
                          ? a / 10
                          : ""}
                    </text>
                  </g>
                );
              })}
            </g>
            <path
              d="M100 27V8M75 108L100 95 125 108M100 78V126"
              stroke="#ffdb76"
              strokeWidth="3"
              fill="none"
            />
            <text
              x="100"
              y="151"
              fill="white"
              textAnchor="middle"
              fontSize="11"
            >
              HDG · MAG
            </text>
          </>
        ) : (
          <>
            {(kind === "airspeed"
              ? Array.from({ length: 21 }, (_, i) => ({
                  angle: airspeedAngle(i * 20),
                  text: i % 2 === 0 ? String(i * 20) : "",
                }))
              : kind === "vsi"
                ? Array.from({ length: 9 }, (_, i) => ({
                    angle: vsiAngle((i - 4) * 500),
                    text: String((i - 4) * 500),
                  }))
                : Array.from({ length: 10 }, (_, i) => ({
                    angle: i * 36,
                    text: String(i),
                  }))
            ).map((t, i) => {
              const s = point(t.angle, 76),
                e = point(t.angle, 86),
                p = point(t.angle, 61);
              return (
                <g key={i}>
                  <path
                    d={`M${s.x} ${s.y}L${e.x} ${e.y}`}
                    stroke="#e5edf2"
                    strokeWidth="2"
                  />
                  <text
                    x={p.x}
                    y={p.y + 4}
                    fill="#e5edf2"
                    textAnchor="middle"
                    fontSize={kind === "vsi" ? 10 : 12}
                  >
                    {t.text}
                  </text>
                </g>
              );
            })}
            {kind === "altitude" ? (
              <>
                <Needle angle={angles.thousands} length={42} color="#ffdb76" />
                <Needle angle={angles.hundreds} />
              </>
            ) : (
              <Needle
                angle={
                  kind === "airspeed"
                    ? airspeedAngle(state.airspeed)
                    : vsiAngle(state.verticalSpeed)
                }
              />
            )}
            <circle cx="100" cy="100" r="6" fill="#d6dfe5" />
            <text
              x="100"
              y="140"
              textAnchor="middle"
              fill="#b0c6d5"
              fontSize="10"
            >
              {kind === "airspeed"
                ? "IAS · kt"
                : kind === "vsi"
                  ? "VS · ft/min"
                  : "ALT · ft"}
            </text>
          </>
        )}
        {readout && (
          <g>
            <rect x="52" y="160" width="96" height="23" rx="4" fill="#0c1721" />
            <text
              x="100"
              y="176"
              textAnchor="middle"
              fill="#a9e3ff"
              fontSize="12"
            >
              {kind === "attitude"
                ? `${state.pitch}° / ${state.roll}°`
                : kind === "airspeed"
                  ? state.airspeed
                  : kind === "altitude"
                    ? state.altitude
                    : kind === "vsi"
                      ? `${state.verticalSpeed > 0 ? "+" : ""}${state.verticalSpeed}`
                      : `${String(normalizeHeading(state.heading)).padStart(3, "0")}°`}
            </text>
          </g>
        )}
      </svg>
      <figcaption>
        <b>{label[0]}</b>
        <span>{label[1]}</span>
        <p className="instrument-intro">{descriptions[kind]}</p>
        <Link href={`/dictionary/${label[2]}`}>术语解释 ↗</Link>
      </figcaption>
    </figure>
  );
}
export function InstrumentPanel({
  state,
  kinds = ["attitude", "airspeed", "altitude", "vsi", "heading"],
  readout = true,
}: {
  state: FlightState;
  kinds?: InstrumentKind[];
  readout?: boolean;
}) {
  return (
    <div className="instruments-grid">
      {kinds.map((k) => (
        <Instrument key={k} kind={k} state={state} readout={readout} />
      ))}
    </div>
  );
}
export function InstrumentLab() {
  const [state, setState] = useState(initialFlight);
  const controls: [
    keyof FlightState,
    string,
    number,
    number,
    number,
    string,
  ][] = [
    ["pitch", "俯仰（上仰为正）", -30, 30, 5, "°"],
    ["roll", "横滚（右坡度为正）", -60, 60, 5, "°"],
    ["airspeed", "指示空速 IAS", 0, 400, 10, "kt"],
    ["altitude", "模拟指示高度", 0, 40000, 100, "ft"],
    ["verticalSpeed", "垂直速度（爬升为正）", -2000, 2000, 100, "ft/min"],
    ["heading", "磁航向", 0, 359, 1, "°"],
  ];
  return (
    <>
      <div className="notice">
        教学模拟 ·
        非经认证的飞行训练设备。参数独立变化，不构成飞行动力学模型。机头上仰不代表一定爬升，航向也不等于地面航迹。
      </div>
      <InstrumentPanel state={state} />
      <div className="paper-panel controls-grid">
        {controls.map(([key, label, min, max, step, unit]) => (
          <div className="slider-field" key={key}>
            <label htmlFor={`control-${key}`}>{label}</label>
            <output htmlFor={`control-${key}`}>
              {state[key]} {unit}
            </output>
            <input
              id={`control-${key}`}
              type="range"
              min={min}
              max={max}
              step={step}
              value={state[key]}
              onChange={(e) =>
                setState({ ...state, [key]: Number(e.target.value) })
              }
            />
          </div>
        ))}
        <button
          className="button secondary"
          onClick={() => setState(initialFlight)}
        >
          恢复初始参数
        </button>
      </div>
      <div className="paper-panel reading-panel">
        <h2>读表约定</h2>
        <p>
          姿态仪：蓝天棕地；俯仰梯每 10°、坡度标记 10° / 20° / 30° /
          60°。固定黄色机翼与地平线的相对位置表示姿态。
        </p>
        <p>
          空速表：教学线性刻度 0–400
          kt，不绘制机型专用彩色速度弧。高度表：白色长针每圈 1,000
          ft，黄色短针每圈 10,000 ft；数字窗消除多圈歧义。
        </p>
        <p>
          垂直速度表：教学线性刻度 ±2,000
          ft/min，零在顶端，左降右升。航向仪：固定顶部基线读取磁航向，北为 000°
          / 360°，东为 090°。未模拟漂移、气压设定及仪表延迟。
        </p>
        <Link className="button primary" href="/academy/cockpit">
          开始仪表挑战 ↗
        </Link>
      </div>
    </>
  );
}
