import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Game } from "@/components/game";
import { PageHeading } from "@/components/ui";
export const metadata = { title: "航司挑战" };
export default function AirlineChallenge() {
  return (
    <div className="container page-content narrow">
      <Link href="/academy" className="back-link">
        <ArrowLeft size={15} />
        返回挑战大厅
      </Link>
      <PageHeading
        eyebrow="FLIGHT ACADEMY / AIRLINE CHALLENGE"
        title="你认识，天空中的这些名字吗？"
        description="看涂装、辨标志、猜代码、识地理。用四种视角，认识全球航空公司。"
      />
      <Game kind="airline" />
      <Link className="text-link" href="/world/airlines">
        前往全球航空公司百科 ↗
      </Link>
    </div>
  );
}
