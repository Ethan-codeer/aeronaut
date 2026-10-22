"use client";

import { useSearchParams } from "next/navigation";
import { Comparison } from "./comparison";
import { Game } from "./game";
import { PageHeading } from "./ui";

// Query parameters are read in the browser so the existing routes can be
// exported for Sites static hosting without losing their query behavior.
export function ComparisonFromQuery() {
  const params = useSearchParams();
  const initial = params.get("a") ?? undefined;
  return <Comparison key={initial ?? "default"} initial={initial} />;
}

export function QuizFromQuery() {
  const params = useSearchParams();
  const review = params.get("mode") === "wrong";
  return (
    <>
      <PageHeading
        eyebrow="FLIGHT ACADEMY / AVIATION QUIZ"
        title={review ? "错题复习" : "知识，准备起飞。"}
        description="30 道真实航空问答，三个难度等级。每一个答案，都带你多懂一点天空。"
      />
      <Game key={review ? "review" : "quiz"} kind="quiz" review={review} />
    </>
  );
}
