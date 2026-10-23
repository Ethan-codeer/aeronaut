import { PageHeading } from "@/components/ui";
import { InstrumentLab } from "@/components/instruments";
export const metadata = { title: "互动仪表实验室" };
export default function Instruments() {
  return (
    <div className="container page-content">
      <PageHeading
        eyebrow="COCKPIT LAB / V1.2"
        title="让每一个刻度，有意义。"
        description="调整六项参数，观察五种仪表。先理解它们各自测量什么，再组合读取。"
      />
      <InstrumentLab />
    </div>
  );
}
