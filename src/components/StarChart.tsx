"use client";

import { motion } from "framer-motion";
import { SIGN_PROFILES, ELEMENT_COLOR } from "@/domain/signs";
import { Mascot, type Mood } from "./Mascot";

/** 12 星座圍成的星盤；越可能的星座越大越亮 */
export function StarChart({ priors, mood }: { priors: number[]; mood: Mood }) {
  const max = Math.max(...priors);
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[300px]" role="img" aria-label="星盤：各星座的可能性">
      <div className="absolute inset-[14%] rounded-full border-[3px] border-dashed border-[var(--ink-soft)] opacity-30" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Mascot mood={mood} size={88} />
      </div>
      {SIGN_PROFILES.map((sign, s) => {
        const angle = (s / 12) * Math.PI * 2 - Math.PI / 2;
        const x = 50 + Math.cos(angle) * 40;
        const y = 50 + Math.sin(angle) * 40;
        const strength = max > 0 ? priors[s] / max : 0;
        const isTop = priors[s] === max && max > 1 / 12 + 0.01;
        return (
          <motion.div
            key={sign.name}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
            animate={{ scale: 0.75 + strength * 0.45 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] text-[13px] font-black"
              style={{
                borderColor: "var(--line)",
                background: `color-mix(in oklab, ${ELEMENT_COLOR[sign.element]} ${Math.round(15 + strength * 85)}%, var(--card))`,
                color: strength > 0.5 ? "#2d2552" : "var(--ink)",
                boxShadow: isTop ? `0 0 0 4px var(--star), 0 3px 0 var(--line)` : "0 3px 0 var(--line)",
              }}
            >
              {sign.name}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
