import Link from "next/link";
import { ExplorationLinks } from "@/components/exploration-links";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Compass,
  FlaskConical,
  Gamepad2,
  Globe2,
  Plane,
  Radio,
  MoveUpRight,
  ScanLine,
} from "lucide-react";
import { aircraft } from "@/data/aircraft";
import { AircraftCard, Reveal } from "@/components/ui";
import { ArrowLink } from "@/components/shell";
export default function Home() {
  return (
    <>
      <section className="hero">
        <img
          className="hero-bg"
          src="/images/a350-900.jpg"
          alt="Airbus A350-900 在首飞期间低空通场"
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="hero-grid" />
        <div className="container hero-content">
          <Reveal>
            <div className="hero-kicker">
              <span className="status-dot" /> YOUR JOURNEY TO THE SKY STARTS
              HERE
            </div>
            <h1>
              每一次仰望，
              <br />
              都是<span>探索的开始。</span>
            </h1>
            <p className="hero-english">
              The World of Flight, at Your Fingertips.
            </p>
            <p className="hero-description">
              从第一架飞机，到下一次飞行。
              <br />
              在这里，读懂天空，发现航空的无限可能。
            </p>
            <div className="hero-buttons">
              <Link href="/atlas" className="button primary">
                开启航空探索
                <ArrowRight size={18} />
              </Link>
              <Link href="/academy" className="button glass">
                <Gamepad2 size={19} />
                挑战你的航空知识
              </Link>
            </div>
          </Reveal>
          <div className="hero-coordinate">
            <span>WELCOME ABOARD</span>
            <Plane size={18} />
            <span>保持好奇 · 即刻启航</span>
          </div>
        </div>
        <div className="hero-bottom">
          <div className="container hero-bottom-inner">
            <span>
              <Compass size={15} /> 为每一位心向天空的探索者
            </span>
            <span>
              EXPLORE. LEARN. TAKE FLIGHT.<span className="scroll-mark">↓</span>
            </span>
          </div>
        </div>
        <a
          className="hero-credit"
          href="https://commons.wikimedia.org/wiki/File:A350_First_Flight_-_Low_pass_02.jpg"
          target="_blank"
          rel="noreferrer"
        >
          © Don-vip / CC BY-SA 3.0 · 图片经显示裁切
        </a>
      </section>
      <section className="discovery-strip">
        <div className="container discovery-inner">
          <span className="small-label">
            YOUR FLIGHT PLAN <span>选择你的探索航线</span>
          </span>
          <Link href="/atlas">
            <BookOpen size={21} />
            <div>
              <b>认识每一架飞机</b>
              <span>Aircraft Atlas</span>
            </div>
            <ArrowUpRight size={17} />
          </Link>
          <Link href="/academy">
            <Gamepad2 size={21} />
            <div>
              <b>让知识更有趣</b>
              <span>Flight Academy</span>
            </div>
            <ArrowUpRight size={17} />
          </Link>
          <Link href="/lab">
            <FlaskConical size={21} />
            <div>
              <b>解开飞行的秘密</b>
              <span>Flight Science Lab</span>
            </div>
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <ExplorationLinks />
      <section className="container section">
        <Reveal>
          <div className="section-heading">
            <div>
              <span className="eyebrow blue">01 / AIRCRAFT ATLAS</span>
              <h2>
                每一架飞机，都有自己的故事<span className="heading-dot">.</span>
              </h2>
              <p>从经典传奇到现代先锋，走近改变世界的飞行器。</p>
            </div>
            <ArrowLink href="/atlas">
              探索全部机型 <span className="count-badge">12</span>
            </ArrowLink>
          </div>
        </Reveal>
        <div className="featured-grid">
          {[aircraft[3], aircraft[8], aircraft[11]].map((a) => (
            <Reveal key={a.id}>
              <AircraftCard aircraft={a} />
            </Reveal>
          ))}
        </div>
        <div className="compare-note">
          <span>
            <ScanLine size={18} />
            <b>好奇两架飞机有多大不同？</b>
            <span>从翼展到航程，让数据告诉你答案。</span>
          </span>
          <ArrowLink href="/atlas/compare">打开机型比较</ArrowLink>
        </div>
      </section>
      <section className="container experience-section">
        <Reveal className="challenge-feature">
          <div className="challenge-grid" />
          <div className="feature-content">
            <span className="eyebrow">02 / FLIGHT ACADEMY</span>
            <span className="pill">
              <span className="status-dot" />
              准备好接受挑战了吗？
            </span>
            <h2>
              你的航空知识，
              <br />
              能飞多远？
            </h2>
            <p>
              从初识天空到资深机迷，
              <br />
              用每一次挑战，点亮你的航空成就。
            </p>
            <Link href="/academy" className="button white">
              进入航空挑战
              <ArrowUpRight size={18} />
            </Link>
            <div className="feature-meta">
              <span>30 道知识问答</span>
              <i />
              <span>3 个难度等级</span>
            </div>
          </div>
          <div className="radar-art">
            <div className="radar-ring ring1" />
            <div className="radar-ring ring2" />
            <div className="radar-ring ring3" />
            <div className="radar-cross" />
            <Plane size={100} strokeWidth={0.8} />
            <span className="radar-point p1" />
            <span className="radar-point p2" />
            <span className="radar-label">KNOWLEDGE IS YOUR ALTITUDE</span>
          </div>
        </Reveal>
        <Reveal className="lab-feature">
          <span className="eyebrow blue">03 / FLIGHT SCIENCE LAB</span>
          <div className="lab-icon-art">
            <svg viewBox="0 0 350 120" aria-hidden="true">
              {[20, 40, 60, 80, 100].map((y, i) => (
                <path
                  key={y}
                  d={`M0 ${y} C90 ${y},130 ${y - 35 - i * 3},190 ${y - 25} S280 ${y},350 ${y}`}
                  fill="none"
                  stroke="#88b5d2"
                  strokeWidth="1.5"
                />
              ))}
              <path
                d="M80 79 Q150 13 253 74 Q190 85 80 79"
                fill="#d3e5ef"
                stroke="#366d91"
                strokeWidth="2"
              />
            </svg>
            <span className="formula">
              L = ½ρv²SC<sub>L</sub>
            </span>
          </div>
          <h2>
            看不见的力，
            <br />
            看得见的科学。
          </h2>
          <p>
            动手调整参数，在交互实验中理解升力，
            <br />
            让每一个“为什么”都有答案。
          </p>
          <ArrowLink href="/lab">进入升力实验室</ArrowLink>
        </Reveal>
      </section>
      <section className="container section world-teaser">
        <div>
          <span className="eyebrow blue">04 / THE AVIATION WORLD</span>
          <h2>天空之下，还有更多值得探索。</h2>
          <p>走进机场，回望航空百年。让好奇心，带你去更远的地方。</p>
          <ArrowLink href="/world">发现航空世界</ArrowLink>
        </div>
        <Link href="/world/airports" className="world-mini">
          <Globe2 />
          <span>
            机场与航路<b>世界的连接点</b>
          </span>
          <MoveUpRight size={17} />
        </Link>
        <Link href="/world#history" className="world-mini">
          <Radio />
          <span>
            航空时间线<b>从梦想，到日常</b>
          </span>
          <MoveUpRight size={17} />
        </Link>
      </section>
      <div className="join-banner">
        <div className="container">
          <Plane size={28} />
          <span>把对天空的热爱，收藏进你的机库。</span>
          <Link href="/hangar">
            建立我的探索档案
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </>
  );
}
