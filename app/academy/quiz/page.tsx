import { Suspense } from "react";
import { QuizFromQuery } from "@/components/query-pages";
export const metadata = { title: "航空知识问答" };
export default function Quiz() {
  return (
    <div className="container page-content narrow">
      <Suspense>
        <QuizFromQuery />
      </Suspense>
    </div>
  );
}
