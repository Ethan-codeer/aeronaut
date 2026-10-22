import { Suspense } from "react";
import { ComparisonFromQuery } from "@/components/query-pages";
import { PageHeading } from "@/components/ui";
export const metadata = { title: "机型参数比较" };
export default function Compare() {
  return (
    <div className="container page-content">
      <PageHeading
        eyebrow="AIRCRAFT COMPARISON / 机型比较"
        title="同一片天空，不同的可能。"
        description="选择任意两架飞机，用一致的单位比较它们的尺寸、能力与设计取向。"
      />
      <Suspense>
        <ComparisonFromQuery />
      </Suspense>
    </div>
  );
}
