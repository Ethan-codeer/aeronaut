import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import "./hybrid.css";
import { Providers } from "@/components/providers";
import { Header, Footer } from "@/components/shell";
export const metadata: Metadata = {
  title: { default: "AERONAUT — 航空探索平台", template: "%s | AERONAUT" },
  description:
    "从飞机百科、趣味挑战到飞行科学实验，探索触手可及的航空世界。The World of Flight, at Your Fingertips.",
  applicationName: "AERONAUT",
  keywords: ["航空", "飞机百科", "航空知识", "飞行原理", "机型对比"],
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="hybrid-ui">
        <Providers>
          <a href="#main" className="skip-link">
            跳转至主要内容
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
