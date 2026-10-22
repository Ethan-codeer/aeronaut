import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  ScanLine,
  Trophy,
  CheckCircle2,
  Target,
} from "lucide-react";
import { PageHeading } from "@/components/ui";
export const metadata = { title: "航空挑战大厅" };
export default function Academy() {
  return (
    <div className="container page-content">
      <PageHeading
        eyebrow="FLIGHT ACADEMY / 航空挑战"
        title="好奇心，是你的第一张登机牌。"
        description="把每一次探索变成一次进步。在挑战中认识飞机，让航空知识成为你的超能力。"
      />
      <div className="academy-banner">
        <div>
          <span className="eyebrow">CLEAR FOR TAKEOFF</span>
          <h2>今天，让你的知识再升一级。</h2>
          <p>无需登录。成绩和成就，都会留在你的个人机库。</p>
        </div>
        <Trophy size={86} strokeWidth={1} />
      </div>
      <div className="two-columns game-choices">
        <article className="paper-panel">
          <div className="game-number">
            01 <BookOpen size={32} />
          </div>
          <span className="eyebrow blue">AVIATION QUIZ</span>
          <h2>航空知识问答</h2>
          <p>
            从发动机到飞行原理，30
            道有解析、有来源的题目，准备好迎接思维的起飞。
          </p>
          <div className="tag-row">
            <span>入门 / 进阶 / 专家</span>
            <span>每轮 10 题</span>
          </div>
          <Link href="/academy/quiz" className="button primary">
            开始知识挑战
            <ArrowUpRight size={18} />
          </Link>
        </article>
        <article className="paper-panel">
          <div className="game-number">
            02 <ScanLine size={32} />
          </div>
          <span className="eyebrow blue">AIRCRAFT SPOTTER</span>
          <h2>看图识飞机</h2>
          <p>
            观察翼梢、发动机和机身轮廓，从审核后的真实照片中找出飞机的身份；回答后再查看识别依据。
          </p>
          <div className="tag-row">
            <span>标准 / 局部模式</span>
            <span>附外形辨认依据</span>
          </div>
          <Link href="/academy/spotter" className="button primary">
            开启识别挑战
            <ArrowUpRight size={18} />
          </Link>
        </article>
        <article className="paper-panel">
          <div className="game-number">
            03 <Target size={32} />
          </div>
          <span className="eyebrow blue">AIRLINE CHALLENGE</span>
          <h2>航司挑战</h2>
          <p>
            看涂装、辨标志、猜代码、识地理。认识连接世界的航空公司与它们的故事。
          </p>
          <div className="tag-row">
            <span>四种玩法</span>
            <span>随机题目与选项</span>
          </div>
          <Link href="/academy/airlines" className="button primary">
            开启航司挑战
            <ArrowUpRight size={18} />
          </Link>
        </article>
      </div>
      <div className="academy-principles">
        <span>
          <CheckCircle2 />
          每题都有知识解析
        </span>
        <span>
          <Target />
          本轮得分与正确率即时反馈
        </span>
        <span>
          <Trophy />
          探索成就自动解锁
        </span>
      </div>
    </div>
  );
}
