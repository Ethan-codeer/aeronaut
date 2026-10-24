import Link from "next/link";
import { PageHeading } from "@/components/ui";
import { ThreeExplorer } from "@/components/three-explorer/explorer";
export const metadata = {
  title: "Boeing 747-8 · 3D Explorer",
  robots: { index: false, follow: false },
};
export default function ExplorerPrototype() {
  return (
    <div className="container page-content">
      <Link href="/lab" className="back-link">
        ← 返回飞行实验室
      </Link>
      <PageHeading
        eyebrow="3D EXPLORER / 飞机外形探索"
        title="飞行的轮廓，不止一个角度。"
        description="探索Boeing 747-8 Intercontinental的驼峰、四台发动机与后掠翼尖。两档模型精度、按需启用与2D降级展示。"
      />
      <div className="module-links">
        <Link href="/lab/anatomy">认识飞机部件 ↗</Link>
        <Link href="/dictionary/wing">机翼术语 ↗</Link>
        <Link href="/dictionary/turbofan">涡扇发动机术语 ↗</Link>
      </div>
      <ThreeExplorer />
    </div>
  );
}
