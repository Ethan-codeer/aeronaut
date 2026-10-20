"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, ExternalLink } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { aircraft, specLabels, SpecKey } from "@/data/aircraft";
import { SafeImage } from "./ui";
export function Comparison({ initial }: { initial?: string }) {
  const [first, setFirst] = useState(
    aircraft.find((a) => a.slug === initial)?.slug ?? "a350-900",
  );
  const [second, setSecond] = useState(
    initial === "787-9" ? "a350-900" : "787-9",
  );
  const a = aircraft.find((x) => x.slug === first)!;
  const b = aircraft.find((x) => x.slug === second)!;
  const [metric, setMetric] = useState<SpecKey>("range");
  const chartData = [
    {
      name: specLabels[metric].label,
      [a.model]: a.specs[metric],
      [b.model]: b.specs[metric],
    },
  ];
  return (
    <>
      <div className="compare-selectors">
        {[a, b].map((plane, i) => (
          <div className="compare-picker" key={i}>
            <label htmlFor={`plane-${i}`} className="eyebrow blue">
              AIRCRAFT 0{i + 1}
            </label>
            <select
              id={`plane-${i}`}
              value={plane.slug}
              onChange={(e) =>
                i === 0 ? setFirst(e.target.value) : setSecond(e.target.value)
              }
            >
              {aircraft.map((x) => (
                <option key={x.id} value={x.slug}>
                  {x.manufacturer} {x.model}
                </option>
              ))}
            </select>
            <SafeImage src={plane.image} alt={`${plane.model} 示意图`} />
            <Link href={`/atlas/${plane.slug}`} className="text-link">
              查看 {plane.model} 档案
              <ExternalLink size={14} />
            </Link>
          </div>
        ))}
        <button
          className="swap-button icon-btn"
          aria-label="交换机型"
          onClick={() => {
            setFirst(second);
            setSecond(first);
          }}
        >
          <ArrowLeftRight size={23} />
        </button>
      </div>
      {first === second ? (
        <div className="notice">
          你选择了同一个机型。选择另一架飞机，即可探索差异。
        </div>
      ) : (
        <>
          <div className="chart-panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow blue">BY THE NUMBERS</span>
                <h2>让差异一目了然</h2>
              </div>
              <select
                aria-label="图表比较指标"
                className="standalone-select"
                value={metric}
                onChange={(e) => setMetric(e.target.value as SpecKey)}
              >
                {(Object.keys(specLabels) as SpecKey[]).map((k) => (
                  <option key={k} value={k}>
                    {specLabels[k].label} ({specLabels[k].unit})
                  </option>
                ))}
              </select>
            </div>
            <p className="muted">
              {specLabels[metric].unit} · 数值较大不代表更适合所有任务
            </p>
            <div className="compare-chart">
              <ResponsiveContainer
                width="100%"
                height={230}
                initialDimension={{ width: 600, height: 230 }}
              >
                <BarChart
                  data={chartData}
                  margin={{ top: 15, right: 20, bottom: 0, left: 15 }}
                  accessibilityLayer
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      color: "#102d43",
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey={a.model}
                    fill="#268bd2"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={100}
                  />
                  <Bar
                    dataKey={b.model}
                    fill="#102e48"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={100}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="table-wrap">
            <table className="comparison-table">
              <caption>基本参数对照 · 高亮表示两机型数值不同</caption>
              <thead>
                <tr>
                  <th>参数</th>
                  <th>
                    {a.manufacturer} {a.model}
                  </th>
                  <th>
                    {b.manufacturer} {b.model}
                  </th>
                  <th>绝对差值</th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(specLabels) as SpecKey[]).map((k) => (
                  <tr
                    key={k}
                    className={a.specs[k] !== b.specs[k] ? "different" : ""}
                  >
                    <th>{specLabels[k].label}</th>
                    {[a, b].map((p) => (
                      <td key={p.id}>
                        <a href={p.sources[k]} target="_blank" rel="noreferrer">
                          {p.specs[k] === null
                            ? "待核实"
                            : `${p.specs[k]?.toLocaleString()} ${specLabels[k].unit}`}
                        </a>
                      </td>
                    ))}
                    <td>
                      {a.specs[k] === null || b.specs[k] === null
                        ? "—"
                        : `${Number(Math.abs(a.specs[k]! - b.specs[k]!).toFixed(3))} ${specLabels[k].unit}`}
                    </td>
                  </tr>
                ))}
                <tr>
                  <th>动力系统</th>
                  <td>{a.engine}</td>
                  <td>{b.engine}</td>
                  <td>—</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="two-columns">
            {[a, b].map((p) => (
              <article className="paper-panel" key={p.id}>
                <span className="eyebrow blue">{p.category}</span>
                <h2>{p.model}</h2>
                <p>{p.description}</p>
                <div className="notice">{p.note}</div>
                <Link href={`/atlas/${p.slug}`} className="text-link">
                  阅读全文
                  <ExternalLink size={14} />
                </Link>
              </article>
            ))}
          </div>
        </>
      )}
    </>
  );
}
