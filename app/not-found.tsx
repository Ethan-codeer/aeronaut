import Link from "next/link";
import { Plane } from "lucide-react";
export default function NotFound() {
  return (
    <div className="container empty-state not-found">
      <Plane size={55} />
      <span className="eyebrow blue">404 / OFF THE FLIGHT PLAN</span>
      <h1>这条航线，暂未开通。</h1>
      <p>返回首页，或在飞机百科寻找你的下一次探索。</p>
      <Link className="button primary" href="/">
        返回探索首页 →
      </Link>
    </div>
  );
}
