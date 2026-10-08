"use client";

import { motion } from "framer-motion";
import { Flower2, Leaf, Snowflake, Sun, WandSparkles, type LucideIcon } from "lucide-react";
import type { Question } from "@/domain/types";

const SEASON_ICON: Record<string, LucideIcon> = { spring: Flower2, summer: Sun, autumn: Leaf, winter: Snowflake };

/** 星靈卡關時的絕招題：問生日季節，玩家可以拒絕 */
export function HintCard({ question, onChoose }: { question: Question; onChoose: (optionId: string | null) => void }) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className="sticker !bg-[var(--accent)] p-5 text-[#2d2552] sm:p-7"
    >
      <span className="mb-3 inline-flex items-center gap-1 rounded-full border-2 border-[var(--line)] bg-[var(--card)] px-3 py-0.5 text-xs font-black text-[var(--ink)]">
        <WandSparkles size={14} aria-hidden /> 絕招
      </span>
      <h2 className="font-display text-3xl font-black">季節透視</h2>
      <p className="mb-6 mt-1 font-bold">
        星靈卡關了！告訴牠你的生日在哪個季節，牠就能把範圍縮小到 3、4 個星座，剩下的再靠讀心。
      </p>
      <p className="mb-3 text-lg font-black">{question.text}</p>
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((opt) => {
          const Icon = SEASON_ICON[opt.id.split("_")[1]] ?? Sun;
          const [name, months] = opt.text.split("（");
          return (
            <button key={opt.id} type="button" className="option flex-col !gap-1 !py-3 text-center" onClick={() => onChoose(opt.id)}>
              <Icon size={22} aria-hidden />
              <span className="text-lg">{name}</span>
              <span className="text-xs text-[var(--ink-soft)]">{months?.replace("）", "")}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => onChoose(null)}
          className="cursor-pointer rounded-full px-4 py-2 text-sm font-black underline underline-offset-4 transition-opacity hover:opacity-70"
        >
          不給偷看，繼續靠讀心
        </button>
      </div>
    </motion.div>
  );
}
