import { AtlasBrowser } from "@/components/atlas-browser";
import { PageHeading } from "@/components/ui";
export const metadata = { title: "飞机百科 Aircraft Atlas" };
export default function Atlas() {
  return (
    <div className="container page-content">
      <PageHeading
        eyebrow="THE AIRCRAFT ATLAS / 飞机百科"
        title="认识天空中的每一位主角。"
        description="12 架精选机型，12 种飞行故事。从外形辨识到技术细节，让热爱更进一步。"
      />
      <AtlasBrowser />
      <div className="notice">
        资料说明：参数为公开参考值，详细页面列出来源与构型说明。照片均附署名与授权来源；暂无授权照片时，原创图为外形学习示意，不用于工程测量或唯一机型判定。
      </div>
    </div>
  );
}
