import { PageHeading } from "@/components/ui";
import { Hangar } from "@/components/hangar";
export const metadata = { title: "我的机库 · 探索档案" };
export default function HangarPage() {
  return (
    <div className="container page-content">
      <PageHeading
        eyebrow="MY HANGAR / 个人机库"
        title="每一份热爱，都值得珍藏。"
        description="你的飞机收藏、挑战日志与探索成就。这里，记录着你与天空的每一次相遇。"
      />
      <Hangar />
    </div>
  );
}
