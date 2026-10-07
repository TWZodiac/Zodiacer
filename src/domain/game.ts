import {
  DEFAULT_CONFIG,
  bayesUpdate,
  pickNextQuestion,
  shouldReveal,
  uniformPriors,
  type EngineConfig,
} from "./engine";
import type { Question } from "./types";

export interface Step {
  question: Question;
  optionId: string | null;
  priorsBefore: number[];
}

export interface Round {
  priors: number[];
  steps: Step[];
  current: Question | null;
  done: boolean;
}

function recentCategories(steps: Step[]): string[] {
  return steps.slice(-2).map((s) => s.question.category);
}

function remainingPool(bank: Question[], steps: Step[]): Question[] {
  const asked = new Set(steps.map((s) => s.question.id));
  return bank.filter((q) => !asked.has(q.id));
}

export function startRound(bank: Question[], rng: () => number, config: EngineConfig = DEFAULT_CONFIG): Round {
  const priors = uniformPriors();
  return { priors, steps: [], current: pickNextQuestion(priors, bank, [], rng, config), done: false };
}

/** 回答目前題目（optionId 為 null 代表跳過），並挑下一題或結束 */
export function answer(
  round: Round,
  optionId: string | null,
  bank: Question[],
  rng: () => number,
  config: EngineConfig = DEFAULT_CONFIG,
): Round {
  const q = round.current;
  if (!q || round.done) return round;

  const priors = optionId ? bayesUpdate(round.priors, q.weights[optionId], config.alpha) : round.priors;
  const steps = [...round.steps, { question: q, optionId, priorsBefore: round.priors }];
  const answered = steps.filter((s) => s.optionId !== null).length;

  // 跳過也算進題數上限，避免無限跳題
  if (shouldReveal(priors, answered, config) || steps.length >= config.maxQuestions + 4) {
    return { priors, steps, current: null, done: true };
  }
  const next = pickNextQuestion(priors, remainingPool(bank, steps), recentCategories(steps), rng, config);
  return { priors, steps, current: next, done: next === null };
}

export function undo(round: Round): Round {
  const last = round.steps[round.steps.length - 1];
  if (!last) return round;
  return { priors: last.priorsBefore, steps: round.steps.slice(0, -1), current: last.question, done: false };
}

export function answeredCount(round: Round): number {
  return round.steps.filter((s) => s.optionId !== null).length;
}
