import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  output: "export",
  experimental: { useTypeScriptCli: false },
};
export default config;
