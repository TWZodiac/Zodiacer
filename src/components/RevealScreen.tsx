"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Undo2, X } from "lucide-react";
import { SIGN_PROFILES } from "@/domain/signs";
import { rankSigns } from "@/domain/engine";
import type { Round } from "@/domain/game";
import { Mascot } from "./Mascot";
import { ConstellationArt } from "./ConstellationArt";

export function RevealScreen({
  round,
  onConfirm,
  onBack,
}: {
  round: Round;
  onConfirm: (actual: number | null) => void;
  onBack: () => void;
}) {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<"thinking" | "shown" | "pick">(reduce ? "shown" : "thinking");
  const guessed = rankSigns(round.priors)[0];
  const sign = SIGN_PROFILES[guessed];

  useEffect(() => {
    if (stage !== "thinking") return;
    const t = setTimeout(() => setStage("shown"), 1800);
    return () => clearTimeout(t);
  }, [stage]);

  return (
    <motion.section
      key="reveal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mx-auto flex w-full max-w-md flex-col items-center text-center"
    >
      <AnimatePresence mode="wait">
        {stage === "thinking" && (
          <motion.div key="thinking" exit={{ opacity: 0, scale: 0.8 }} className="flex flex-col items-center py-16">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.8, ease: "easeInOut" }}>
              <Mascot mood="think" size={140} />
            </motion.div>
            <p className="font-display mt-6 text-2xl font-black">正在對照星盤…</p>
            <p className="mt-2 text-[var(--ink-soft)]">你回答了 {round.steps.length} 題</p>
          </motion.div>
        )}

        {stage === "shown" && (
          <motion.div
            key="shown"
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 16 }}
            className="w-full"
          >
            <p className="font-display mb-3 text-xl font-black">我猜你是…</p>
            <div className="sticker mb-6 flex flex-col items-center px-6 py-8">
              <ConstellationArt sign={guessed} size={150} />
              <h2 className="font-display mt-2 text-5xl font-black">{sign.name}座</h2>
              <p className="mt-1 text-sm font-bold text-[var(--ink-soft)]">
                {sign.english} · {sign.dates}
              </p>
              <p className="mt-4 rounded-full bg-[var(--card-2)] px-4 py-1 text-sm font-bold">
                星靈把握度 {Math.round(round.priors[guessed] * 100)}%
              </p>
            </div>
            <p className="mb-4 font-bold">猜對了嗎？</p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="btn btn-primary" onClick={() => onConfirm(guessed)}>
                <Check size={18} aria-hidden /> 對，就是我
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setStage("pick")}>
                <X size={18} aria-hidden /> 不對喔
              </button>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="mt-5 inline-flex cursor-pointer items-center gap-1 text-sm font-bold text-[var(--ink-soft)] hover:text-[var(--ink)]"
            >
              <Undo2 size={14} aria-hidden /> 回上一題重新回答
            </button>
          </motion.div>
        )}

        {stage === "pick" && (
          <motion.div key="pick" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
            <Mascot mood="pout" size={96} />
            <p className="font-display mb-1 mt-2 text-2xl font-black">可惡，那你是什麼星座？</p>
            <p className="mb-5 text-sm text-[var(--ink-soft)]">告訴星靈正確答案，下次牠會猜得更準。</p>
            <div className="grid grid-cols-3 gap-2.5">
              {SIGN_PROFILES.map((s, i) => (
                <button
                  key={s.name}
                  type="button"
                  disabled={i === guessed}
                  onClick={() => onConfirm(i)}
                  className="btn btn-ghost flex-col !gap-0 !rounded-2xl !px-1 !py-2"
                >
                  <span className="font-black">{s.name}座</span>
                  <span className="text-[11px] font-bold text-[var(--ink-soft)]">{s.dates}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => onConfirm(null)}
              className="mt-5 cursor-pointer text-sm font-bold text-[var(--ink-soft)] underline-offset-4 hover:text-[var(--ink)] hover:underline"
            >
              不想說，直接看結果
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
