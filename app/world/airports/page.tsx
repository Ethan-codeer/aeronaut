import Link from "next/link";
import { PageHeading } from "@/components/ui";
import { AirportBrowser } from "@/components/airport-browser";
import { AirportChallenge } from "@/components/airport-challenge";
export const metadata = { title: "全球机场地图" };
export default function Airports() {
  return (
    <div className="container page-content">
      <PageHeading
        eyebrow="AIRPORT EXPLORER / V1.2"
        title="世界，在这里连接。"
        description="探索七大地区的50座国际机场。从三字代码到城市地理，认识航线背后的连接点。"
      />
      <AirportBrowser />
      <section className="section" id="challenge">
        <PageHeading
          eyebrow="AIRPORT CHALLENGE"
          title="给好奇心，一个目的地。"
          description="找机场、猜代码、辨地区。完成后查看正确位置和机场知识。"
        />
        <AirportChallenge />
      </section>
      <Link href="/dictionary/iata" className="text-link">
        IATA 与 ICAO 有什么区别？ ↗
      </Link>
    </div>
  );
}
