import Link from "next/link";
import { PageHeading } from "@/components/ui";
import { LiveryGallery } from "@/components/livery-gallery";
export const metadata = { title: "航司涂装博物馆" };
export default function Liveries() {
  return (
    <div className="container page-content">
      <PageHeading
        eyebrow="LIVERY GALLERY / V1.2"
        title="让天空，有自己的色彩。"
        description="20 件航空视觉档案，记录经典、历史与特别涂装。航空摄影保留作者、许可和来源，不推定未知的使用时期。"
      />
      <div className="module-links">
        <Link href="/academy/tails">看机尾猜航司 ↗</Link>
        <Link href="/world/airlines">探索全球航司 ↗</Link>
      </div>
      <LiveryGallery />
    </div>
  );
}
