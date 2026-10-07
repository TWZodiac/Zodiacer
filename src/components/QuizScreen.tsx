"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Home, Undo2 } from "lucide-react";
import { SIGN_PROFILES } from "@/domain/signs";
import { hunch } from "@/domain/commentary";
import { DEFAULT_CONFIG } from "@/domain/engine";
import { answeredCount, type Round } from "@/domain/game";
import type { Reaction } from "@/hooks/useZodiacGame";
import { StarChart } from "./StarChart";

const BOOLEAN_LABEL: Record<string, string> = { 是: "是，很像我", 否: "不太像我" };
const LETTERS = ["A", "B", "C", "D", "E", "F"];

export function QuizScreen({
  round,
  reaction,
  onChoose,
  onBack,
  onHome,
}: {
  round: Round;
  reaction: Reaction | null;
  onChoose: (optionId: string | null) => void;
  onBack: () => void;
  onHome: () => void;
}) {
  const q = round.current;
  const answered = answeredCount(round);
  const confidence = Math.max(...round.priors);
  const mood = confidence > 0.45 ? "wow" : answered === 0 ? "idle" : "think";

  // 數字鍵 1–6 快速作答
  useEffect(() => {
    if (!q) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= q.options.length) onChoose(q.options[n - 1].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [q, onChoose]);

  if (!q) return null;

  return (
    <motion.section
      key="quiz"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mx-auto grid w-full max-w-5xl items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={onHome} className="btn btn-ghost !p-2.5" aria-label="回首頁">
            <Home size={18} aria-hidden />
          </button>
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-xs font-bold text-[var(--ink-soft)]">
              <span>第 {round.steps.length + 1} 題</span>
              <span>星靈把握度 {Math.round(confidence * 100)}%</span>
            </div>
            <div className="h-4 overflow-hidden rounded-full border-[3px] border-[var(--line)] bg-[var(--card)]">
              <motion.div
                className="h-full rounded-full bg-[var(--accent)]"
                animate={{ width: `${Math.min(100, (answered / DEFAULT_CONFIG.maxQuestions) * 100)}%` }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={onBack}
            disabled={round.steps.length === 0}
            className="btn btn-ghost !p-2.5"
            aria-label="回上一題"
          >
            <Undo2 size={18} aria-hidden />
          </button>
        </div>

        <StarChart priors={round.priors} mood={mood} />

        <div className="sticker relative px-5 py-4 text-left" aria-live="polite">
          <div className="absolute -top-3 left-1/2 h-5 w-5 -translate-x-1/2 rotate-45 border-l-[3px] border-t-[3px] border-[var(--line)] bg-[var(--card)]" />
          <AnimatePresence mode="wait">
            <motion.div key={round.steps.length} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {reaction && (
                <p className="mb-1 text-sm text-[var(--ink-soft)]">
                  選「{reaction.optionText}」的人，最常是
                  <span className="font-black text-[var(--ink)]"> {SIGN_PROFILES[reaction.sign].name}座</span>
                </p>
              )}
              <p className="font-bold">{hunch(round.priors, answered)}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 40, rotate: 2 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          exit={{ opacity: 0, x: -40, rotate: -2 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          className="sticker p-5 sm:p-7"
        >
          <span className="mb-3 inline-block rounded-full border-2 border-[var(--line)] bg-[var(--lilac)] px-3 py-0.5 text-xs font-black text-[#2d2552]">
            {q.category}
          </span>
          <h2 className="font-display mb-6 text-2xl font-black leading-snug sm:text-[1.7rem]">{q.text}</h2>
          <div className={q.type === "boolean" ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3"}>
            {q.options.map((opt, i) => (
              <button key={opt.id} type="button" className="option" onClick={() => onChoose(opt.id)}>
                {q.type === "boolean" ? (
                  <span className="w-full py-2 text-center text-lg">{BOOLEAN_LABEL[opt.text] ?? opt.text}</span>
                ) : (
                  <>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[var(--line)] bg-[var(--accent)] text-sm font-black text-[#2d2552]">
                      {LETTERS[i]}
                    </span>
                    <span>{opt.text}</span>
                  </>
                )}
              </button>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => onChoose(null)}
              className="cursor-pointer rounded-full px-4 py-2 text-sm font-bold text-[var(--ink-soft)] underline-offset-4 transition-colors hover:text-[var(--ink)] hover:underline"
            >
              很難說，跳過這題
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
}
