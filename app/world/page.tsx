import Link from "next/link";
import {
  ArrowUpRight,
  MapPin,
  RadioTower,
  Route,
  Globe2,
  Clock3,
  ExternalLink,
} from "lucide-react";
import { PageHeading } from "@/components/ui";
export const metadata = { title: "航空世界 · 机场与历史" };
const timeline = [
  [
    "1903",
    "动力飞行的开端",
    "12 月 17 日，莱特兄弟在基蒂霍克附近完成了有动力、可操纵、持续的载人飞机飞行。",
    "https://airandspace.si.edu/explore/stories/wright-brothers",
  ],
  [
    "1952",
    "喷气客运时代",
    "德哈维兰 Comet 于 1952 年投入定期商业服务，成为第一款投入航线运营的喷气式客机。",
    "https://www.rafmuseum.org.uk/research/collections/de-havilland-comet-1xb/",
  ],
  [
    "1969",
    "宽体时代的新轮廓",
    "Boeing 747 首飞；同年 Concorde 首飞。航空业同时探索更大的运力与更高的速度。",
    "https://www.boeing.com/history",
  ],
  [
    "2005",
    "双层巨人的首飞",
    "Airbus A380 于 4 月 27 日完成首飞，成为航空工程的新里程碑。",
    "https://www.airbus.com/en/about-us/our-history",
  ],
  [
    "2023",
    "C919 开启商业运营",
    "5 月 28 日，中国东方航空使用 C919 执行首个商业载客航班。",
    "https://www.comac.cc/cpyzr/c919/",
  ],
];
export default function World() {
  return (
    <div className="container page-content">
      <PageHeading
        eyebrow="THE AVIATION WORLD / 航空世界"
        title="让好奇心，飞得更远。"
        description="飞机连接城市，也连接时代。探索机场的运行逻辑，走过人类追逐天空的百年历程。"
      />
      <div className="world-hero">
        <img
          src="/images/a330-900.jpg"
          alt="Airbus A330-900 首飞时升空的瞬间"
        />
        <div>
          <span className="eyebrow">A WORLD CONNECTED BY FLIGHT</span>
          <h2>
            每一条航线背后，
            <br />
            都是一个更大的世界。
          </h2>
          <a href="#airports" className="button white">
            从机场开始
            <ArrowUpRight size={17} />
          </a>
        </div>
        <a
          className="world-photo-credit"
          href="https://commons.wikimedia.org/wiki/File:Airbus_A330neo_first_take-off_(cropped).jpg"
          target="_blank"
          rel="noreferrer"
        >
          © Alex Cheban · CC BY-SA 4.0
        </a>
      </div>
      <section className="section" id="airports">
        <div className="section-heading">
          <div>
            <span className="eyebrow blue">01 / AIRPORT KNOWLEDGE</span>
            <h2>读懂一座机场</h2>
            <p>从三字代码到跑道数字，机场也有自己的语言。</p>
          </div>
        </div>
        <div className="three-columns">
          {[
            {
              icon: MapPin,
              title: "IATA 与 ICAO 代码",
              text: "IATA 三字代码主要用于票务、行李等商业场景，例如 PEK。ICAO 四字地点代码用于航空运行，例如北京首都机场为 ZBAA。代码体系不同，不可互换。",
              url: "https://www.iata.org/en/publications/directories/code-search/",
            },
            {
              icon: Route,
              title: "跑道上的数字",
              text: "跑道编号一般由磁方位角除以 10 后取整表示，如 09 约对应 090°。相反方向编号通常相差 18。平行跑道会用 L、C、R 区分。",
              url: "https://www.faa.gov/air_traffic/publications/atpubs/aim_html/",
            },
            {
              icon: RadioTower,
              title: "从登机口到天空",
              text: "飞机通常依次经历推出、滑行、起飞等阶段。机坪、滑行道和跑道承担不同任务；塔台与地面管制岗位按职责协调运行。",
              url: "https://www.faa.gov/air_traffic",
            },
          ].map((x) => (
            <article className="paper-panel" key={x.title}>
              <x.icon size={30} className="blue" />
              <h3>{x.title}</h3>
              <p>{x.text}</p>
              <a
                className="text-link"
                href={x.url}
                target="_blank"
                rel="noreferrer"
              >
                查阅官方资料
                <ExternalLink size={14} />
              </a>
            </article>
          ))}
        </div>
      </section>
      <section className="section" id="history">
        <div className="section-heading">
          <div>
            <span className="eyebrow blue">02 / A CENTURY IN THE SKY</span>
            <h2>从梦想，到日常</h2>
            <p>沿着时间线，重访那些让世界变小的时刻。</p>
          </div>
          <Clock3 size={27} />
        </div>
        <div className="timeline">
          {timeline.map(([year, title, text, url]) => (
            <article key={year}>
              <span className="timeline-year">{year}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-link"
                >
                  历史资料
                  <ExternalLink size={13} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="future-map" id="flight-map">
        <div className="map-decoration" aria-hidden="true">
          <Globe2 size={210} strokeWidth={0.45} />
        </div>
        <div>
          <span className="eyebrow">03 / ON THE HORIZON</span>
          <h2>未来，让航线在眼前展开。</h2>
          <p>
            我们计划在后续版本接入有授权的航班数据，探索世界航路与实时飞行。当前版本没有连接实时
            API，不显示航班位置、状态或模拟实时数据。
          </p>
          <span className="pill">规划中 · V2 EXPLORATION</span>
          <Link href="/atlas" className="text-link">
            此刻，先去认识飞机
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}
