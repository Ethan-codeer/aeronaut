"use client";
import { useState } from "react";
import { ArrowUp, RotateCcw, Wind, FlaskConical, Info } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { calculateLift, AIR_DENSITY } from "@/lib/science";
import { useProgress } from "./providers";
export function LiftLab() {
  const [speed, setSpeed] = useState(70);
  const [area, setArea] = useState(122);
  const [coefficient, setCoefficient] = useState(1);
  const { update } = useProgress();
  const lift = calculateLift(speed, area, coefficient);
  const data = Array.from({ length: 16 }, (_, i) => ({
    speed: i * 10,
    lift: Math.round(calculateLift(i * 10, area, coefficient) / 1000),
  }));
  function record() {
    update((p) => (p.labUsed ? p : { ...p, labUsed: true }));
  }
  const controls = [
    {
      id: "speed",
      label: "相对气流速度",
      symbol: "v",
      value: speed,
      min: 0,
      max: 150,
      step: 1,
      unit: "m/s",
      change: setSpeed,
    },
    {
      id: "area",
      label: "机翼参考面积",
      symbol: "S",
      value: area,
      min: 10,
      max: 500,
      step: 1,
      unit: "m²",
      change: setArea,
    },
    {
      id: "cl",
      label: "升力系数",
      symbol: "CL",
      value: coefficient,
      min: 0,
      max: 2,
      step: 0.05,
      unit: "无量纲",
      change: setCoefficient,
    },
  ];
  return (
    <>
      <div className="lab-layout">
        <div className="paper-panel lab-controls">
          <span className="eyebrow blue">YOUR EXPERIMENT</span>
          <h2>调整你的飞行参数</h2>
          {controls.map((c) => (
            <div className="slider-control" key={c.id}>
              <label htmlFor={c.id}>
                {c.label}
                <span>{c.symbol}</span>
              </label>
              <output htmlFor={c.id}>
                {c.value}
                <small>{c.unit}</small>
              </output>
              <input
                id={c.id}
                type="range"
                min={c.min}
                max={c.max}
                step={c.step}
                value={c.value}
                onChange={(e) => {
                  c.change(Number(e.target.value));
                  record();
                }}
              />
              <div className="range-labels">
                <span>
                  {c.min} {c.unit}
                </span>
                <span>
                  {c.max} {c.unit}
                </span>
              </div>
            </div>
          ))}
          <p className="muted">
            固定空气密度 ρ = {AIR_DENSITY} kg/m³
            <br />
            近似标准海平面条件
          </p>
          <button
            className="button secondary"
            onClick={() => {
              setSpeed(70);
              setArea(122);
              setCoefficient(1);
            }}
          >
            <RotateCcw size={16} />
            重置实验
          </button>
        </div>
        <div className="lab-visual">
          <div className="lab-visual-top">
            <span>
              <span className="status-dot" /> SIMPLIFIED LIFT MODEL
            </span>
            <Wind size={22} />
          </div>
          <svg
            className="airflow-svg"
            viewBox="0 0 650 300"
            role="img"
            aria-label={`翼型气流概念示意，速度 ${speed} 米每秒，升力 ${(lift / 1000).toFixed(1)} 千牛`}
          >
            <defs>
              <linearGradient id="wingFill" x2="0" y2="1">
                <stop stopColor="#b7d8ed" />
                <stop offset="1" stopColor="#427b9d" />
              </linearGradient>
              <marker
                id="arrow"
                markerWidth="7"
                markerHeight="7"
                refX="6"
                refY="3.5"
                orient="auto"
              >
                <path d="M0 0L7 3.5L0 7" fill="none" stroke="#67c5fb" />
              </marker>
            </defs>
            {[50, 85, 120, 155, 190, 225, 260].map((y, i) => (
              <path
                className="airflow-line"
                key={y}
                d={`M-30 ${y} C150 ${y},185 ${y - (i < 4 ? 60 : 15)},300 ${y - (i < 4 ? 50 : 5)} S480 ${y},680 ${y}`}
                fill="none"
                stroke="#4b9bc6"
                strokeWidth="1.5"
                strokeDasharray="35 15"
                style={{
                  animationDuration: `${Math.max(0.4, 5 - speed / 35)}s`,
                  animationPlayState: speed === 0 ? "paused" : "running",
                  opacity: 0.4 + i * 0.07,
                }}
              />
            ))}
            <path
              d="M175 170 Q272 74 478 170 Q326 190 175 170Z"
              fill="url(#wingFill)"
              stroke="#c9e8f9"
              strokeWidth="2"
            />
            <line
              x1="320"
              y1="145"
              x2="320"
              y2={145 - Math.min(110, lift / 3500)}
              stroke="#67c5fb"
              strokeWidth="3"
              markerEnd="url(#arrow)"
            />
            <text x="338" y="65" fill="#a3d7f5" fontSize="14">
              LIFT
            </text>
          </svg>
          <div className="lift-reading">
            <span>理论升力 / THEORETICAL LIFT</span>
            <div aria-live="polite">
              {(lift / 1000).toLocaleString("en-US", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
              <small>kN</small>
              <ArrowUp size={28} />
            </div>
            <p>
              {Math.round(lift).toLocaleString()} N · 当前设定下的简化计算结果
            </p>
          </div>
        </div>
      </div>
      <div className="two-columns lab-bottom">
        <div className="paper-panel">
          <span className="eyebrow blue">THE EQUATION</span>
          <h2>理解升力的四个变量</h2>
          <div className="big-formula">
            L = ½ × ρ × v² × S × C<sub>L</sub>
          </div>
          <p>
            密度、速度的平方、参考面积与升力系数共同决定理论升力。当其他条件固定时，速度增加一倍，升力变为四倍。
          </p>
          <a
            className="text-link"
            href="https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/lift-equation/"
            target="_blank"
            rel="noreferrer"
          >
            NASA · The Lift Equation ↗
          </a>
        </div>
        <div className="paper-panel">
          <span className="eyebrow blue">SPEED & LIFT</span>
          <h2>速度怎样改变升力？</h2>
          <p className="muted">保持当前 S 与 CL · 横轴 m/s，纵轴 kN</p>
          <div style={{ height: 180, minWidth: 0 }}>
            <ResponsiveContainer
              width="100%"
              height="100%"
              initialDimension={{ width: 600, height: 180 }}
            >
              <AreaChart
                data={data}
                margin={{ left: 0, right: 15, top: 10, bottom: 0 }}
                accessibilityLayer
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="speed" />
                <YAxis width={45} />
                <Tooltip
                  contentStyle={{ background: "#fff", color: "#102d43" }}
                />
                <Area
                  type="monotone"
                  dataKey="lift"
                  name="升力 (kN)"
                  stroke="#268bd2"
                  fill="#268bd2"
                  fillOpacity={0.15}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="notice model-notice">
        <Info size={23} />
        <div>
          <b>这是简化教学模型，不是完整的飞行仿真。</b>
          <p>
            模型固定空气密度，将 CL 作为独立输入；CL
            不等同于迎角，它还受到翼型、雷诺数、马赫数、襟翼及失速状态等因素影响。示意气流没有经过
            CFD
            计算，不能用于推算真实流场、失速边界、飞行性能或操作决策。速度为相对空气的速度，不是地速；本实验不计算阻力、推力与力矩。
          </p>
        </div>
      </div>
      <div className="lab-caption">
        <FlaskConical size={16} />
        改变任一参数，即可解锁机库中的「科学探索者」成就。
      </div>
    </>
  );
}
