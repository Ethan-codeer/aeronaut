import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PageHeading } from "@/components/ui";
import { AirlineBrowser } from "@/components/airline-browser";
export const metadata = { title: "全球航空公司" };
export default function AirlineAtlas() {
  return (
    <div className="container page-content">
      <Link href="/world" className="back-link">
        <ArrowLeft size={15} />
        返回航空世界
      </Link>
      <PageHeading
        eyebrow="GLOBAL AIRLINES / 全球航空公司"
        title="每一种涂装，连接一个世界。"
        description="认识 15 家代表性航司：从代码与总部，到发展历史、机队与独特的品牌故事。"
      />
      <div className="airline-atlas-banner">
        <div>
          <span className="eyebrow blue">LEARN. RECOGNIZE. EXPLORE.</span>
          <h2>把认识，变成你的下一次挑战。</h2>
          <p>联盟与机队是注明日期的资料快照，不代表实时运营状态。</p>
        </div>
        <Link className="button primary" href="/academy/airlines">
          航司挑战
          <ArrowUpRight size={17} />
        </Link>
      </div>
      <AirlineBrowser />
    </div>
  );
}
