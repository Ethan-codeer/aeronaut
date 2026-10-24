import { liveries } from "@/data/liveries";
import { airports } from "@/data/airports";
import Link from "next/link";
const modules = [
  ["/dictionary", "航空术语词典", "69 TERMS / 读懂天空的语言"],
  ["/lab/anatomy", "互动飞机结构图", "08 PARTS / 每个部件的任务"],
  [
    "/world/liveries",
    "航司涂装博物馆",
    `${liveries.length} LIVERIES / 飞行视觉文化`,
  ],
  ["/academy/cockpit", "飞行仪表挑战", "25 QUESTIONS / 读懂飞行状态"],
  [
    "/world/airports",
    "全球机场地图",
    `${airports.length} AIRPORTS / 世界的连接点`,
  ],
];
export function ExplorationLinks() {
  return (
    <section className="container new-explorations">
      <div className="section-heading">
        <div>
          <span className="eyebrow blue">
            V1.3 / INTERACTIVE AVIATION EXPERIENCE
          </span>
          <h2>五个新视角，继续探索天空。</h2>
          <p>从一个术语，到一座机场。让每次好奇，都连接下一次发现。</p>
        </div>
      </div>
      <div className="exploration-links">
        {modules.map(([href, title, sub], i) => (
          <Link href={href} key={href}>
            <span>0{i + 1} ↗</span>
            <b>{title}</b>
            <span>{sub}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
