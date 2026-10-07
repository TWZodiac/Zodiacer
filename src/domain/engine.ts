import type { Question } from "./types";

export const SIGN_COUNT = 12;

export interface EngineConfig {
  /** 每題證據的折扣，避免刻板印象題讓機率暴衝 */
  alpha: number;
  minQuestions: number;
  maxQuestions: number;
  /** 最高機率到達這個值就揭曉 */
  confidence: number;
  /** 從資訊增益前 K 名中抽題，讓每局題目不同 */
  topK: number;
  /** 與前兩題同主題時的資訊增益折扣 */
  repeatCategoryPenalty: number;
}

export const DEFAULT_CONFIG: EngineConfig = {
  alpha: 0.85,
  minQuestions: 8,
  maxQuestions: 16,
  confidence: 0.6,
  topK: 4,
  repeatCategoryPenalty: 0.6,
};

export const uniformPriors = (): number[] => Array(SIGN_COUNT).fill(1 / SIGN_COUNT);

/** P(s|a) ∝ P(s) · P(a|s)^alpha */
export function bayesUpdate(priors: number[], likelihoods: number[], alpha: number): number[] {
  const unnormalized = priors.map((p, s) => p * Math.pow(likelihoods[s], alpha));
  const sum = unnormalized.reduce((a, b) => a + b, 0);
  return unnormalized.map((p) => p / sum);
}

export function entropy(probs: number[]): number {
  return probs.reduce((acc, p) => (p > 0 ? acc - p * Math.log2(p) : acc), 0);
}

/** 在目前機率下，回答這題預期能減少多少不確定性（bits） */
export function informationGain(priors: number[], q: Question): number {
  let ig = 0;
  for (const likelihoods of Object.values(q.weights)) {
    const pA = likelihoods.reduce((acc, l, s) => acc + l * priors[s], 0);
    if (pA <= 0) continue;
    for (let s = 0; s < SIGN_COUNT; s++) {
      const l = likelihoods[s];
      if (l > 0 && priors[s] > 0) ig += priors[s] * l * Math.log2(l / pA);
    }
  }
  return ig;
}

export function pickNextQuestion(
  priors: number[],
  pool: Question[],
  recentCategories: string[],
  rng: () => number,
  config: EngineConfig = DEFAULT_CONFIG,
): Question | null {
  if (pool.length === 0) return null;
  const scored = pool
    .map((q) => {
      const penalty = recentCategories.includes(q.category) ? config.repeatCategoryPenalty : 1;
      return { q, score: informationGain(priors, q) * penalty };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, config.topK);

  const total = scored.reduce((acc, x) => acc + x.score, 0);
  if (total <= 0) return scored[0].q;
  let r = rng() * total;
  for (const x of scored) {
    r -= x.score;
    if (r <= 0) return x.q;
  }
  return scored[scored.length - 1].q;
}

export function shouldReveal(priors: number[], answered: number, config: EngineConfig = DEFAULT_CONFIG): boolean {
  if (answered >= config.maxQuestions) return true;
  return answered >= config.minQuestions && Math.max(...priors) >= config.confidence;
}

export function rankSigns(priors: number[]): number[] {
  return priors.map((p, s) => ({ p, s })).sort((a, b) => b.p - a.p).map((x) => x.s);
}

/** 選了這個選項的人「最可能」是哪個星座（相對於平均的倍率最高者） */
export function optionLeader(likelihoods: number[]): { sign: number; lift: number } {
  const mean = likelihoods.reduce((a, b) => a + b, 0) / likelihoods.length;
  let sign = 0;
  for (let s = 1; s < likelihoods.length; s++) if (likelihoods[s] > likelihoods[sign]) sign = s;
  return { sign, lift: likelihoods[sign] / mean };
}

/** 回答與某星座的契合度：log(P(a|s) / 平均 P(a))，正值代表「很像這個星座」 */
export function answerAffinity(likelihoods: number[], sign: number): number {
  const mean = likelihoods.reduce((a, b) => a + b, 0) / likelihoods.length;
  return Math.log2(likelihoods[sign] / mean);
}

/** 小型可重現亂數產生器（mulberry32） */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
