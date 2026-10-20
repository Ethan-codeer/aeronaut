import { Game } from "@/components/game";
import { PageHeading } from "@/components/ui";
export const metadata = { title: "看图识飞机" };
export default function Spotter() {
  return (
    <div className="container page-content narrow">
      <PageHeading
        eyebrow="FLIGHT ACADEMY / AIRCRAFT SPOTTER"
        title="你能认出天空中的它吗？"
        description="从发动机到翼梢，把每一个细节变成你的识别线索。"
      />
      <Game kind="spotter" />
    </div>
  );
}
