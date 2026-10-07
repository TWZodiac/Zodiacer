"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, RotateCcw, Share2, Sparkles, Trophy } from "lucide-react";
import { SIGN_PROFILES, ELEMENT_COLOR, ELEMENT_NAME } from "@/domain/signs";
import { rankSigns } from "@/domain/engine";
import { signInsights } from "@/domain/insights";
import { ACHIEVEMENTS } from "@/domain/achievements";
import type { Round } from "@/domain/game";
import type { Outcome } from "@/hooks/useZodiacGame";
import { Mascot } from "./Mascot";
import { ConstellationArt } from "./ConstellationArt";

export function ResultScreen({
  round,
  outcome,
  onRestart,
  onOpenCollection,
}: {
  round: Round;
  outcome: Outcome;
  onRestart: () => void;
  onOpenCollection: () => void;
}) {
  const [shared, setShared] = useState<string | null>(null);
  const featured = outcome.actual ?? outcome.guessed;
  const sign = SIGN_PROFILES[featured];
  const guessedSign = SIGN_PROFILES[outcome.guessed];
  const correct = outcome.actual === null ? null : outcome.actual === outcome.guessed;
  const insights = signInsights(round.steps, featured);
  const ranked = rankSigns(round.priors);
  const actualRank = outcome.actual === null ? null : ranked.indexOf(outcome.actual) + 1;

  const headline =
    correct === true
      ? { mood: "happy" as const, title: "被我猜中了吧！", sub: `只用了 ${round.steps.length} 題就看穿你` }
      : correct === false
        ? {
            mood: "pout" as const,
            title: "你騙過了星靈！",
            sub: `星靈猜${guessedSign.name}座，${sign.name}座排在第 ${actualRank} 名`,
          }
        : { mood: "wow" as const, title: `星靈的答案：${guessedSign.name}座`, sub: "沒關係，這是你的祕密" };

  const share = async () => {
    const text =
      correct === false
        ? `我騙過了星靈！牠猜我是${guessedSign.name}座，其實我是${sign.name}座。你也來試試能不能騙過牠：`
        : `星靈猜我是${guessedSign.name}座（把握度 ${Math.round(round.priors[outcome.guessed] * 100)}%）！你也來讓牠猜猜看：`;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "星靈猜猜看", text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text}${url}`);
      setShared("已複製分享文字");
    } catch {
      setShared(null);
    }
  };

  return (
    <motion.section
      key="result"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mx-auto flex w-full max-w-2xl flex-col gap-5"
    >
      <div className="flex items-center gap-4">
        <Mascot mood={headline.mood} size={84} />
        <div>
          <h2 className="font-display text-3xl font-black">{headline.title}</h2>
          <p className="text-[var(--ink-soft)]">{headline.sub}</p>
        </div>
      </div>

      {(outcome.newCard || outcome.newAchievements.length > 0) && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="sticker flex flex-col gap-2 !bg-[var(--accent)] px-5 py-4 text-[#2d2552]"
        >
          {outcome.newCard && (
            <p className="flex items-center gap-2 font-black">
              <Sparkles size={18} aria-hidden /> 圖鑑新增：{guessedSign.name}座！
            </p>
          )}
          {outcome.newAchievements.map((id) => {
            const a = ACHIEVEMENTS.find((x) => x.id === id);
            return a ? (
              <p key={id} className="flex items-center gap-2 font-bold">
                <Trophy size={18} aria-hidden /> 解鎖成就「{a.title}」：{a.description}
              </p>
            ) : null;
          })}
        </motion.div>
      )}

      <article className="sticker overflow-hidden">
        <div
          className="flex items-center gap-4 border-b-[3px] border-[var(--line)] px-5 py-5"
          style={{ background: `color-mix(in oklab, ${ELEMENT_COLOR[sign.element]} 22%, var(--card))` }}
        >
          <ConstellationArt sign={featured} size={96} />
          <div>
            <p className="text-xs font-black text-[var(--ink-soft)]">
              {ELEMENT_NAME[sign.element]} · {sign.dates}
            </p>
            <h3 className="font-display text-3xl font-black">{sign.name}座</h3>
            <p className="font-bold">{sign.tagline}</p>
          </div>
        </div>
        <div className="px-5 py-5">
          <div className="mb-3 flex flex-wrap gap-2">
            {sign.traits.map((t) => (
              <span key={t} className="rounded-full border-2 border-[var(--line)] bg-[var(--card-2)] px-3 py-0.5 text-sm font-bold">
                {t}
              </span>
            ))}
          </div>
          <p className="leading-relaxed">{sign.blurb}</p>

          {insights.alike.length > 0 && (
            <div className="mt-5">
              <h4 className="mb-2 font-black">你最像{sign.name}座的回答</h4>
              <ul className="flex flex-col gap-2">
                {insights.alike.map((x) => (
                  <li key={x.questionText} className="rounded-2xl bg-[var(--card-2)] px-4 py-2.5 text-sm">
                    <span className="text-[var(--ink-soft)]">{x.questionText}</span>
                    <br />
                    <span className="font-bold">→ {x.optionText}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {insights.unlike.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-2 font-black">最不像{sign.name}座的地方</h4>
              <ul className="flex flex-col gap-2">
                {insights.unlike.map((x) => (
                  <li key={x.questionText} className="rounded-2xl border-2 border-dashed border-[var(--ink-soft)] px-4 py-2.5 text-sm">
                    <span className="text-[var(--ink-soft)]">{x.questionText}</span>
                    <br />
                    <span className="font-bold">→ {x.optionText}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </article>

      <section className="sticker px-5 py-5" aria-labelledby="spectrum-title">
        <h4 id="spectrum-title" className="mb-4 font-black">
          完整星盤
        </h4>
        <ul className="flex flex-col gap-2">
          {ranked.map((s, i) => {
            const p = SIGN_PROFILES[s];
            return (
              <li key={p.name} className="flex items-center gap-3 text-sm">
                <span className={`w-12 shrink-0 font-bold ${s === outcome.actual ? "underline decoration-[3px] underline-offset-4" : ""}`}>
                  {p.name}
                </span>
                <div className="h-4 flex-1 overflow-hidden rounded-full border-2 border-[var(--line)] bg-[var(--card-2)]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: ELEMENT_COLOR[p.element] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(2, round.priors[s] * 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.04 }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right font-bold tabular-nums">{(round.priors[s] * 100).toFixed(1)}%</span>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button type="button" className="btn btn-primary" onClick={onRestart}>
          <RotateCcw size={18} aria-hidden /> 再玩一次
        </button>
        <button type="button" className="btn btn-ghost" onClick={share}>
          <Share2 size={18} aria-hidden /> {shared ?? "分享結果"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onOpenCollection}>
          <BookOpen size={18} aria-hidden /> 星座圖鑑
        </button>
      </div>
    </motion.section>
  );
}
