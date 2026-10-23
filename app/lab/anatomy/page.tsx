import { PageHeading } from "@/components/ui";
import { AnatomyExplorer } from "@/components/anatomy-explorer";
export const metadata = { title: "互动飞机结构图" };
export default function Anatomy() {
  return (
    <div className="container page-content">
      <PageHeading
        eyebrow="AIRCRAFT ANATOMY / V1.2"
        title="一架飞机，八个探索起点。"
        description="轻触机翼、尾翼或发动机，理解每个部件如何协同工作。也可用 Tab 和回车键选择。"
      />
      <AnatomyExplorer />
    </div>
  );
}
