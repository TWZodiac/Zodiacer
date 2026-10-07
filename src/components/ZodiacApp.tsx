"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { BANK, useZodiacGame } from "@/hooks/useZodiacGame";
import { HomeScreen } from "./HomeScreen";
import { QuizScreen } from "./QuizScreen";
import { RevealScreen } from "./RevealScreen";
import { ResultScreen } from "./ResultScreen";
import { CollectionSheet } from "./CollectionSheet";

export function ZodiacApp() {
  const game = useZodiacGame();
  const [collectionOpen, setCollectionOpen] = useState(false);
  const closeCollection = useCallback(() => setCollectionOpen(false), []);

  return (
    <MotionConfig reducedMotion="user">
      <main className="flex min-h-dvh w-full flex-col items-center justify-center px-4 py-8 sm:px-6">
        <AnimatePresence mode="wait">
          {game.phase === "home" && (
            <HomeScreen
              key="home"
              profile={game.profile}
              questionCount={BANK.length}
              onStart={game.start}
              onOpenCollection={() => setCollectionOpen(true)}
            />
          )}
          {game.phase === "quiz" && (
            <QuizScreen
              key="quiz"
              round={game.round}
              reaction={game.reaction}
              onChoose={game.choose}
              onBack={game.back}
              onHome={game.home}
            />
          )}
          {game.phase === "reveal" && (
            <RevealScreen key="reveal" round={game.round} onConfirm={game.confirm} onBack={game.back} />
          )}
          {game.phase === "result" && game.outcome && (
            <ResultScreen
              key="result"
              round={game.round}
              outcome={game.outcome}
              onRestart={game.start}
              onOpenCollection={() => setCollectionOpen(true)}
            />
          )}
        </AnimatePresence>
      </main>
      <AnimatePresence>
        {collectionOpen && <CollectionSheet profile={game.profile} onClose={closeCollection} />}
      </AnimatePresence>
    </MotionConfig>
  );
}
