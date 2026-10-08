import {
  DEFAULT_CONFIG,
  bayesUpdate,
  realisticLikelihoods,
  pickNextQuestion,
  shouldReveal,
  uniformPriors,
  type EngineConfig,
} from "./engine";
import { HINT_QUESTION, isHint } from "./hint";
import { stemOf } from "./pairs";
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

/** 這局的絕招狀態：沒出現、用了、被玩家拒絕 */
export type HintState = "none" | "used" | "refused";

export function hintState(steps: Step[]): HintState {
  const step = steps.find((s) => isHint(s.question));
  if (!step) return "none";
  return step.optionId ? "used" : "refused";
}

function recentCategories(steps: Step[]): string[] {
  return steps.slice(-2).map((s) => s.question.category);
}

/** 問過的原題整題排除，避免同一題的不同二選一在一局裡重複出現 */
function remainingPool(bank: Question[], steps: Step[]): Question[] {
  const asked = new Set(steps.map((s) => stemOf(s.question)));
  return bank.filter((q) => !asked.has(stemOf(q)));
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

  // 絕招題問的是事實（生日季節），直接用精確機率，不做刻板印象的折扣
  const hint = isHint(q);
  const likelihoods = optionId
    ? hint
      ? q.weights[optionId]
      : realisticLikelihoods(q.weights[optionId], config.stereotype)
    : null;
  const priors = likelihoods ? bayesUpdate(round.priors, likelihoods, hint ? 1 : config.alpha) : round.priors;
  const steps = [...round.steps, { question: q, optionId, priorsBefore: round.priors }];
  const answered = steps.filter((s) => s.optionId !== null).length;

  // 跳過也算進題數上限，避免無限跳題
  if (shouldReveal(priors, answered, config) || steps.length >= config.maxQuestions + 4) {
    return { priors, steps, current: null, done: true };
  }
  // 答滿 hintAfter 題還沒把握，就使出一次絕招
  if (config.hintAfter !== null && answered >= config.hintAfter && hintState(steps) === "none") {
    return { priors, steps, current: HINT_QUESTION, done: false };
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
