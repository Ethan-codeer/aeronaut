import { PageHeading } from "@/components/ui";
import { ThreeExplorer } from "@/components/three-explorer/explorer";
export const metadata = {
  title: "3D Explorer · 独立技术原型",
  robots: { index: false, follow: false },
};
export default function ExplorerPrototype() {
  return (
    <div className="container page-content">
      <PageHeading
        eyebrow="3D EXPLORER / TECHNOLOGY PROTOTYPE"
        title="飞行的轮廓，不止一个角度。"
        description="一个独立的双发客机3D展示验证。按需启用、自由观察，也可始终使用2D预览。"
      />
      <ThreeExplorer />
    </div>
  );
}
