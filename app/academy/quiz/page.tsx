import { Game } from "@/components/game";
import { PageHeading } from "@/components/ui";
export const metadata = { title: "航空知识问答" };
export default async function Quiz({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const p = await searchParams;
  return (
    <div className="container page-content narrow">
      <PageHeading
        eyebrow="FLIGHT ACADEMY / AVIATION QUIZ"
        title={p.mode === "wrong" ? "错题复习" : "知识，准备起飞。"}
        description="30 道真实航空问答，三个难度等级。每一个答案，都带你多懂一点天空。"
      />
      <Game kind="quiz" review={p.mode === "wrong"} />
    </div>
  );
}
