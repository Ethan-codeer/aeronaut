import { PageHeading } from "@/components/ui";
import { Game } from "@/components/game";
export const metadata = { title: "看机尾猜航司" };
export default function Tails() {
  return (
    <div className="container page-content">
      <PageHeading
        eyebrow="TAIL LIVERY CHALLENGE / V1.2"
        title="只看机尾，你能认出谁？"
        description="复用现有航司题库中两张已审核的机尾照片，观察图案与配色；答后再显示来源与辨认依据。"
      />
      <Game kind="airline" liveryOnly />
    </div>
  );
}
