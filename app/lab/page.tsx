import Link from "next/link";
import { LiftLab } from "@/components/lift-lab";
import { PageHeading } from "@/components/ui";
export const metadata = { title: "飞行科学实验室 · 升力实验" };
export default function Lab() {
  return (
    <div className="container page-content">
      <PageHeading
        eyebrow="FLIGHT SCIENCE LAB / 飞行科学实验室"
        title="让看不见的升力，有迹可循。"
        description="动手改变气流、机翼和升力系数，探索支撑每一次飞行的基础科学。"
      />
      <div className="module-links">
        <Link href="/lab/3d-explorer" prefetch={false}>
          3D 飞机探索 ↗
        </Link>
        <Link href="/lab/anatomy">互动飞机结构图 ↗</Link>
        <Link href="/lab/instruments">互动仪表实验室 ↗</Link>
        <Link href="/dictionary/lift">升力术语 ↗</Link>
      </div>
      <LiftLab />
    </div>
  );
}
