import { DictionaryBrowser } from "@/components/dictionary-browser";
import { PageHeading } from "@/components/ui";
export const metadata = { title: "航空术语词典" };
export default function Dictionary() {
  return (
    <div className="container page-content">
      <PageHeading
        eyebrow="AVIATION DICTIONARY / V1.2"
        title="读懂天空的语言。"
        description="中英文术语、使用情景与常见误区。从一个词，连接一整片航空世界。"
      />
      <DictionaryBrowser />
    </div>
  );
}
