import type { NextConfig } from "next";

// GitHub Pages 部署在 /Zodiacer 底下；本機或其他環境可用 NEXT_BASE_PATH 覆寫（例如設為空字串）
const basePath = process.env.NEXT_BASE_PATH ?? "/Zodiacer";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
};

export default nextConfig;
