"use client";

import { motion } from "framer-motion";
import { useZodiacGame } from "@/hooks/useZodiacGame";
import zodiacData from "@/data/zodiac_question_bank_50.json";
import { QuestionData } from "@/lib/engine";
import { useState } from "react";
import { RefreshCcw, Undo2, Star } from "lucide-react";

const allQuestions = zodiacData.questions as unknown as QuestionData[];

export default function Home() {
  const {
    status,
    priors,
    history,
    currentQuestion,
    startGame,
    handleAnswer,
    skipQuestion,
    undo,
    getTopSigns,
  } = useZodiacGame(allQuestions);

  const onSelectSingle = (id: string) => {
    handleAnswer([id]);
  };

  const handleSkip = () => {
    skipQuestion();
  };

  const topSigns = getTopSigns(3);
  const top1Prob = status !== "idle" ? Math.round(topSigns[0].prob * 100) : 0;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10 overflow-hidden">
      <>
        {status === "idle" && (
          <motion.div
            key="idle"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="glass-panel p-8 md:p-12 rounded-2xl max-w-lg w-full text-center flex flex-col items-center"
          >
            <div className="w-24 h-24 rounded-full bg-[var(--primary)] mb-6 flex items-center justify-center border-4 border-[var(--cta)] shadow-[var(--shadow-glow)]">
              <Star className="w-12 h-12 text-[var(--cta)]" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-4 uppercase tracking-widest text-[var(--foreground)] glitch-text">
              星<span className="text-[var(--cta)]">座</span>機<span className="text-[var(--cta)]">台</span>
            </h1>
            <p className="text-[var(--secondary)] mb-8 leading-relaxed text-sm md:text-base font-medium">
              進入你的宇宙神祕探索之旅。透過問題信號來尋找你真實的太陽星座。
              <br />
              <span className="text-xs opacity-75">(機率共鳴遊戲．僅供娛樂)</span>
            </p>
            <button onClick={startGame} className="btn-primary w-full text-lg tracking-widest flex items-center justify-center gap-2">
              啟動連結 <Star className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {status === "playing" && currentQuestion && (
          <motion.div
            key="playing"
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-full max-w-2xl flex flex-col"
          >
            {/* Header / Progress */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                <button onClick={undo} disabled={history.length === 0} className="p-2 rounded-full glass-panel hover:bg-[var(--primary)] hover:text-white disabled:opacity-50 transition-colors cursor-pointer" title="返回上一步">
                  <Undo2 size={20} />
                </button>
              </div>
              <div className="text-right font-mono uppercase">
                <div className="text-sm text-[var(--secondary)] font-bold">信號 {history.length + 1} / 20</div>
                <div className="text-xs text-[var(--cta)] font-bold tracking-widest mt-1">最高共鳴率: {top1Prob}%</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 mb-8 overflow-hidden border-4 border-[var(--primary)] bg-[var(--background-mid)] p-0.5 rounded-full">
              <motion.div
                className="h-full bg-[var(--cta)] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(history.length / 20) * 100}%` }}
              />
            </div>

            {/* Question Card */}
            <motion.div
              key={currentQuestion.id}
              initial={{ x: 30, scale: 0.98 }}
              animate={{ x: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="glass-panel p-6 md:p-8 rounded-2xl relative overflow-hidden"
            >

              <div className="flex items-center gap-2 uppercase text-[10px] font-black tracking-widest text-[var(--secondary)] mb-3">
                <span className="w-2 h-2 bg-[var(--cta)] inline-block"></span>
                {currentQuestion.type === "boolean" ? "是非題" : "單選題"}
              </div>
              <h2 className="text-xl md:text-2xl font-bold mb-8 leading-snug tracking-wide">
                {currentQuestion.text}
              </h2>

              <div className="space-y-4">
                {currentQuestion.options.map((opt) => {
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        onSelectSingle(opt.id);
                      }}
                      className="w-full text-left p-4 rounded-xl border-4 transition-all duration-200 cursor-pointer bg-[var(--background)] border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transform hover:-translate-y-1 active:translate-y-1 shadow-[0_4px_0_var(--primary)] hover:shadow-[0_2px_0_var(--primary)] active:shadow-none"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-bold font-heading text-lg">{opt.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-10 flex justify-center items-center gap-4">
                <button onClick={handleSkip} className="text-xs uppercase tracking-widest font-bold text-[var(--secondary)] hover:text-[var(--foreground)] transition-colors cursor-pointer py-2 px-4">
                  [ 略過此題 ]
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {status === "finished" && (
          <motion.div
            key="finished"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-full max-w-4xl flex flex-col items-center"
          >
            <div className="glass-panel p-8 md:p-12 rounded-2xl w-full text-center relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle,var(--cta)_0%,transparent_70%)] opacity-10 pointer-events-none"></div>

              <h2 className="text-3xl font-black mb-1 tracking-[0.3em] text-[var(--cta)] glitch-text">分析解密完成</h2>
              <p className="text-[var(--secondary)] mb-10 text-sm font-mono tracking-wide">已運行 {history.length} 次信號判定。</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative z-10">
                {topSigns.map((s, idx) => (
                  <motion.div
                    initial={{ scale: 0.8, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: idx * 0.1 }}
                    key={s.sign}
                    className={`p-6 rounded-xl border-4 flex flex-col items-center justify-center ${idx === 0 ? 'bg-[var(--cta)] border-[#9A3412] text-white shadow-[0_8px_0_#9A3412] transform md:-translate-y-4' : 'bg-[var(--background)] border-[var(--primary)] shadow-[0_4px_0_var(--primary)] opacity-90'}`}
                  >
                    <div className={`text-sm tracking-widest uppercase font-bold mb-4 ${idx === 0 ? 'text-white/80' : 'text-[var(--secondary)]'}`}>
                      {idx === 0 ? '首選結果' : '次要可能'}
                    </div>
                    <h3 className={`text-3xl font-black mb-2 tracking-wider ${idx === 0 ? 'glitch-text text-white' : ''}`}>{s.sign}</h3>
                    <div className={`font-mono font-bold text-xl ${idx === 0 ? 'text-white' : 'text-[var(--primary)]'}`}>
                      {(s.prob * 100).toFixed(1)}%
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Posterior Chart */}
              <div className="mb-12 text-left relative z-10 bg-[var(--background-mid)] p-6 rounded-xl border-4 border-[var(--primary)]">
                <h4 className="font-bold font-heading text-lg tracking-widest uppercase text-[var(--primary)] mb-6 border-b-4 border-[var(--primary)] pb-2">完整星座共鳴光譜</h4>
                <div className="space-y-4 font-mono">
                  {priors.map((prob, idx) => {
                    const signName = zodiacData.sign_order[idx];
                    const percentage = (prob * 100).toFixed(1);
                    return (
                      <div key={signName} className="flex items-center gap-4 text-sm">
                        <div className="w-12 text-right font-bold tracking-wider">{signName}</div>
                        <div className="flex-1 bg-[var(--background)] border-2 border-[var(--primary)] h-4 rounded-full overflow-hidden p-[2px]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${prob * 100}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="bg-[var(--secondary)] h-full rounded-full"
                          />
                        </div>
                        <div className="w-16 text-right font-bold text-[var(--primary)]">{percentage}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-center gap-6 relative z-10">
                <button onClick={() => window.location.reload()} className="btn-primary uppercase tracking-widest text-sm flex items-center gap-2">
                  <RefreshCcw size={16} /> 重啟系統
                </button>
                <button onClick={undo} className="btn-secondary uppercase tracking-widest text-sm flex items-center gap-2 border-[var(--glass-border)]">
                  <Undo2 size={16} /> 撤銷上一步
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </>
    </main>
  );
}
