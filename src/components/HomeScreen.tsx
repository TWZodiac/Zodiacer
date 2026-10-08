"use client";

import { motion } from "framer-motion";
import { BookOpen, Sparkles } from "lucide-react";
import { SIGN_PROFILES } from "@/domain/signs";
import type { Profile } from "@/domain/profile";
import { hitRate } from "@/domain/profile";
import { Mascot } from "./Mascot";
import { ConstellationArt } from "./ConstellationArt";

export function HomeScreen({
  profile,
  questionCount,
  roundLength,
  onStart,
  onOpenCollection,
}: {
  profile: Profile;
  questionCount: number;
  roundLength: { min: number; max: number };
  onStart: () => void;
  onOpenCollection: () => void;
}) {
  const rate = hitRate(profile);
  return (
    <motion.section
      key="home"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      className="mx-auto flex w-full max-w-xl flex-col items-center text-center"
    >
      <div className="relative mb-2 flex h-48 w-full items-center justify-center">
        {[0, 4, 8, 11].map((s, i) => (
          <div
            key={s}
            className="twinkle absolute"
            style={{
              left: ["2%", "74%", "6%", "78%"][i],
              top: ["4%", "0%", "58%", "56%"][i],
              animationDelay: `${i * 0.6}s`,
            }}
          >
            <ConstellationArt sign={s} size={72} />
          </div>
        ))}
        <Mascot mood="happy" size={140} />
      </div>

      <p className="mb-2 rounded-full border-[3px] border-[var(--line)] bg-[var(--card)] px-4 py-1 text-sm font-bold shadow-[0_3px_0_var(--line)]">
        Zodiacer 星座猜謎
      </p>
      <h1 className="font-display mb-3 text-4xl font-black leading-tight sm:text-5xl">星靈猜猜看</h1>
      <p className="mb-8 max-w-sm text-base leading-relaxed text-[var(--ink-soft)]">
        回答幾個生活小問題，星靈小星會一步步看穿你的星座。猜中了算牠厲害，猜錯了算你神祕！
      </p>

      <button type="button" onClick={onStart} className="btn btn-primary mb-4 w-full max-w-xs text-lg">
        <Sparkles size={20} aria-hidden /> 開始占卜
      </button>
      <button type="button" onClick={onOpenCollection} className="btn btn-ghost w-full max-w-xs">
        <BookOpen size={18} aria-hidden /> 星座圖鑑 {profile.collected.length}/12
      </button>

      <dl className="mt-10 grid w-full grid-cols-3 gap-3">
        {[
          { label: "題庫", value: `${questionCount} 題` },
          { label: "每局", value: `${roundLength.min}–${roundLength.max} 題` },
          { label: "星靈命中率", value: rate === null ? "—" : `${Math.round(rate * 100)}%` },
        ].map((item) => (
          <div key={item.label} className="sticker px-2 py-3">
            <dt className="text-xs font-bold text-[var(--ink-soft)]">{item.label}</dt>
            <dd className="font-display text-xl font-black">{item.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 text-sm text-[var(--ink-soft)]">
        挑戰：換個心情作答，讓星靈猜出全部{" "}
        <span className="font-bold text-[var(--ink)]">{SIGN_PROFILES.length}</span> 個星座，集滿圖鑑！
      </p>
      <p className="mt-2 text-xs text-[var(--ink-soft)]">僅供娛樂，題目根據網路上常見的星座印象設計。</p>
    </motion.section>
  );
}
