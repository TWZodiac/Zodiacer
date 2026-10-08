"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ClipboardCopy, Download, Lock, Trophy, X } from "lucide-react";
import { SIGN_PROFILES } from "@/domain/signs";
import { ACHIEVEMENTS } from "@/domain/achievements";
import { hitRate, type Profile } from "@/domain/profile";
import { downloadProfile } from "@/lib/profileStorage";
import { ConstellationArt } from "./ConstellationArt";

export function CollectionSheet({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const rate = hitRate(profile);
  const [copy, setCopy] = useState<"idle" | "copied" | "manual">("idle");
  // 嵌在別的頁面裡（例如試玩預覽）時瀏覽器常會擋下載，只提供複製
  const embedded = window.self !== window.top;
  const json = JSON.stringify(profile, null, 2);

  const copyRecords = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopy("copied");
    } catch {
      setCopy("manual");
    }
  };

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-end justify-center bg-[#17142e]/50 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="collection-title"
        className="sticker max-h-[92dvh] w-full max-w-2xl overflow-y-auto !rounded-b-none px-5 pb-8 pt-5 sm:!rounded-[28px]"
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        exit={{ y: 60 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="collection-title" className="font-display text-2xl font-black">
            星座圖鑑 {profile.collected.length}/12
          </h2>
          <button ref={closeRef} type="button" onClick={onClose} className="btn btn-ghost !p-2" aria-label="關閉圖鑑">
            <X size={18} aria-hidden />
          </button>
        </div>

        <p className="mb-4 text-sm text-[var(--ink-soft)]">
          星靈每猜出一個新星座，就會收進圖鑑。共玩了 {profile.plays.length} 局
          {rate !== null && `，星靈命中率 ${Math.round(rate * 100)}%`}。
        </p>

        <ul className="mb-8 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {SIGN_PROFILES.map((s, i) => {
            const unlocked = profile.collected.includes(i);
            return (
              <li
                key={s.name}
                className={`flex flex-col items-center rounded-3xl border-[3px] border-[var(--line)] px-1 py-3 ${unlocked ? "bg-[var(--card-2)]" : "bg-[var(--card)] opacity-70"}`}
              >
                <ConstellationArt sign={i} size={64} locked={!unlocked} />
                <span className="font-black">{unlocked ? `${s.name}座` : "？？座"}</span>
                <span className="text-[11px] font-bold text-[var(--ink-soft)]">{unlocked ? s.tagline : "尚未遇見"}</span>
              </li>
            );
          })}
        </ul>

        <h3 className="mb-3 font-black">成就</h3>
        <ul className="mb-8 grid gap-2 sm:grid-cols-2">
          {ACHIEVEMENTS.map((a) => {
            const done = a.unlocked(profile);
            return (
              <li
                key={a.id}
                className={`flex items-center gap-3 rounded-2xl border-2 border-[var(--line)] px-3 py-2 ${done ? "bg-[var(--accent)] text-[#2d2552]" : "opacity-60"}`}
              >
                {done ? <Trophy size={18} aria-hidden /> : <Lock size={18} aria-hidden />}
                <div>
                  <p className="text-sm font-black">{a.title}</p>
                  <p className="text-xs">{a.description}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className={`grid gap-2 ${embedded ? "" : "sm:grid-cols-2"}`}>
          <button type="button" onClick={copyRecords} disabled={profile.plays.length === 0} className="btn btn-ghost w-full text-sm">
            <ClipboardCopy size={16} aria-hidden /> {copy === "copied" ? "已複製作答紀錄" : "複製作答紀錄"}
          </button>
          {!embedded && (
            <button
              type="button"
              onClick={() => downloadProfile(profile)}
              disabled={profile.plays.length === 0}
              className="btn btn-ghost w-full text-sm"
            >
              <Download size={16} aria-hidden /> 下載 JSON
            </button>
          )}
        </div>
        {copy === "manual" && (
          <textarea
            id="records-json"
            readOnly
            value={json}
            onFocus={(e) => e.currentTarget.select()}
            aria-label="作答紀錄 JSON，請全選後複製"
            className="mt-3 h-32 w-full rounded-2xl border-2 border-[var(--line)] bg-[var(--card-2)] p-3 font-mono text-xs"
          />
        )}
        <p className="mt-2 text-center text-xs text-[var(--ink-soft)]">紀錄只存在這台裝置的瀏覽器裡。</p>
      </motion.div>
    </motion.div>
  );
}
