import { PageHeading } from "@/components/ui";
import { CockpitChallenge } from "@/components/cockpit-challenge";
export const metadata = { title: "飞行仪表挑战" };
export default function Cockpit() {
  return (
    <div className="container page-content">
      <PageHeading
        eyebrow="COCKPIT ACADEMY / V1.2"
        title="从仪表，读懂飞行。"
        description="25 道分级挑战，练习俯仰、横滚、空速、高度、垂直速度与综合判读。"
      />
      <CockpitChallenge />
    </div>
  );
}
