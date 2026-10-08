import type { Metadata, Viewport } from "next";
import { Baloo_2, Noto_Sans_TC } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-baloo",
  weight: ["600", "800"],
  subsets: ["latin"],
});

const noto = Noto_Sans_TC({
  variable: "--font-noto",
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "星靈猜猜看｜Zodiacer",
  description: "回答幾個生活小問題，讓星靈猜出你的星座。收集 12 星座圖鑑，看看你能不能騙過星靈！",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff6ec" },
    { media: "(prefers-color-scheme: dark)", color: "#17142e" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant" className={`${baloo.variable} ${noto.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
