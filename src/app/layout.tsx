import type { Metadata } from "next";
import { Baloo_2, Comic_Neue } from "next/font/google";
import "./globals.css";

const baloo2 = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
});

const comicNeue = Comic_Neue({
  variable: "--font-comic",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zodiacer",
  description: "A fun and enigmatic zodiac guessing game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${baloo2.variable} ${comicNeue.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
