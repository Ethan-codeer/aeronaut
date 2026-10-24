import { airlineQuestions } from "@/data/airline-questions";
import { PageHeading } from "@/components/ui";
import { Game } from "@/components/game";
export const metadata = { title: "看机尾猜航司" };
export default function Tails() {
  return (
    <div className="container page-content">
      <PageHeading
        eyebrow="TAIL LIVERY CHALLENGE / V1.3"
        title="只看机尾，你能认出谁？"
        description={`${airlineQuestions.filter((q) => q.type === "livery").length} 道已审核机尾题，观察图案与配色，认识经典、历史及特别涂装；答后查看来源与辨认依据。`}
      />
      <Game kind="airline" liveryOnly />
    </div>
  );
}
