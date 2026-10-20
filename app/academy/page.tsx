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
          <p>无需登录。成绩、错题和成就，都会留在你的个人机库。</p>
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
            观察翼梢、发动机和机身轮廓，从授权照片、原创示意图与识别线索中找出飞机的真实身份。
          </p>
          <div className="tag-row">
            <span>11 个真实机型</span>
            <span>附外形辨认依据</span>
          </div>
          <Link href="/academy/spotter" className="button primary">
            开启识别挑战
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
          错题自动加入复习记录
        </span>
        <span>
          <Trophy />
          探索成就自动解锁
        </span>
      </div>
    </div>
  );
}
