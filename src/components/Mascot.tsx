"use client";

import { motion, useReducedMotion } from "framer-motion";

export type Mood = "idle" | "think" | "happy" | "wow" | "pout";

/** 星靈小星：圓潤的五角星角色 */
export function Mascot({ mood = "idle", size = 96 }: { mood?: Mood; size?: number }) {
  const reduce = useReducedMotion();
  const eyes =
    mood === "happy" ? (
      <>
        <path d="M38 52 q5 -6 10 0" />
        <path d="M58 52 q5 -6 10 0" />
      </>
    ) : mood === "think" ? (
      <>
        <circle cx="44" cy="50" r="3.5" fill="var(--line)" stroke="none" />
        <circle cx="64" cy="48" r="3.5" fill="var(--line)" stroke="none" />
      </>
    ) : (
      <>
        <circle cx="43" cy="51" r={mood === "wow" ? 5 : 4} fill="var(--line)" stroke="none" />
        <circle cx="63" cy="51" r={mood === "wow" ? 5 : 4} fill="var(--line)" stroke="none" />
      </>
    );
  const mouth =
    mood === "wow" ? (
      <ellipse cx="53" cy="63" rx="4" ry="5" fill="var(--line)" stroke="none" />
    ) : mood === "pout" ? (
      <path d="M47 66 q6 -5 12 0" />
    ) : mood === "think" ? (
      <path d="M48 64 h10" />
    ) : (
      <path d="M46 61 q7 7 14 0" />
    );

  return (
    <motion.svg
      viewBox="0 0 106 106"
      width={size}
      height={size}
      aria-hidden
      animate={reduce ? undefined : { y: [0, -6, 0], rotate: mood === "think" ? [0, -4, 0] : [0, 2, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <path
        d="M53 6 L65 37 L99 39 L72 60 L82 94 L53 75 L24 94 L34 60 L7 39 L41 37 Z"
        fill="var(--star)"
        stroke="var(--line)"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <g stroke="var(--line)" strokeWidth="3.5" strokeLinecap="round" fill="none">
        {eyes}
        {mouth}
      </g>
      <circle cx="34" cy="60" r="4.5" fill="var(--peach)" opacity="0.7" />
      <circle cx="72" cy="60" r="4.5" fill="var(--peach)" opacity="0.7" />
    </motion.svg>
  );
}
