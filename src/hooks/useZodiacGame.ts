"use client";

import { useCallback, useEffect, useState } from "react";
import bankJson from "@/data/question_bank.json";
import { optionLeader, rankSigns } from "@/domain/engine";
import { answer, answeredCount, startRound, undo, type Round } from "@/domain/game";
import { addPlay, emptyProfile, updateLastPlay, type Profile } from "@/domain/profile";
import { unlockedIds } from "@/domain/achievements";
import type { Question, QuestionBank } from "@/domain/types";
import { loadProfile, saveProfile } from "@/lib/profileStorage";

export const BANK = (bankJson as unknown as QuestionBank).questions as Question[];

export type Phase = "home" | "quiz" | "reveal" | "result";

export interface Reaction {
  questionId: number;
  optionText: string;
  sign: number;
}

export interface Outcome {
  guessed: number;
  actual: number | null;
  newCard: boolean;
  newAchievements: string[];
}

const EMPTY_ROUND: Round = { priors: Array(12).fill(1 / 12), steps: [], current: null, done: false };

export function useZodiacGame() {
  const [phase, setPhase] = useState<Phase>("home");
  const [round, setRound] = useState<Round>(EMPTY_ROUND);
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [profile, setProfile] = useState<Profile>(emptyProfile);

  useEffect(() => {
    // localStorage 只能在瀏覽器讀，靜態輸出時先用空白檔案
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfile(loadProfile());
  }, []);

  const commitProfile = useCallback((next: Profile) => {
    setProfile(next);
    saveProfile(next);
  }, []);

  const start = useCallback(() => {
    setRound(startRound(BANK, Math.random));
    setReaction(null);
    setOutcome(null);
    setPhase("quiz");
  }, []);

  const choose = useCallback(
    (optionId: string | null) => {
      const q = round.current;
      if (!q) return;
      const next = answer(round, optionId, BANK, Math.random);
      setRound(next);
      if (optionId) {
        const option = q.options.find((o) => o.id === optionId);
        setReaction({ questionId: q.id, optionText: option?.text ?? "", sign: optionLeader(q.weights[optionId]).sign });
      } else {
        setReaction(null);
      }
      if (next.done) setPhase("reveal");
    },
    [round],
  );

  const back = useCallback(() => {
    setRound((r) => undo(r));
    setReaction(null);
    setPhase("quiz");
  }, []);

  /** 揭曉後玩家回報真實星座（null = 不想說） */
  const confirm = useCallback(
    (actual: number | null) => {
      const guessed = rankSigns(round.priors)[0];
      const before = unlockedIds(profile);
      let next = addPlay(profile, {
        at: new Date().toISOString(),
        guessed,
        actual: null,
        correct: null,
        questions: answeredCount(round),
        priors: round.priors,
        answers: round.steps.map((s) => ({ questionId: s.question.id, optionId: s.optionId })),
      });
      next = updateLastPlay(next, actual);
      commitProfile(next);
      setOutcome({
        guessed,
        actual,
        newCard: !profile.collected.includes(guessed),
        newAchievements: unlockedIds(next).filter((id) => !before.includes(id)),
      });
      setPhase("result");
    },
    [round, profile, commitProfile],
  );

  const home = useCallback(() => setPhase("home"), []);

  return { phase, round, reaction, outcome, profile, start, choose, back, confirm, home, commitProfile };
}
