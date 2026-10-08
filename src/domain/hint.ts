import { signOfDate } from "./signs";
import type { Question } from "./types";

export const HINT_QUESTION_ID = 900;

const SEASONS = [
  { key: "spring", text: "春天（3–5 月）", months: [3, 4, 5] },
  { key: "summer", text: "夏天（6–8 月）", months: [6, 7, 8] },
  { key: "autumn", text: "秋天（9–11 月）", months: [9, 10, 11] },
  { key: "winter", text: "冬天（12–2 月）", months: [12, 1, 2] },
];

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** 按錯季節時不要把真正的星座直接刪掉，留一點點機率 */
const MISTAP_FLOOR = 0.01;

/** P(季節 | 星座)：用平年逐日計算每個星座的生日落在各季節的比例 */
function seasonLikelihoods(): number[][] {
  const counts = SEASONS.map(() => Array(12).fill(0));
  for (let m = 1; m <= 12; m++) {
    const season = SEASONS.findIndex((x) => x.months.includes(m));
    for (let d = 1; d <= DAYS_IN_MONTH[m - 1]; d++) counts[season][signOfDate(m, d)]++;
  }
  const bySign = Array.from({ length: 12 }, (_, s) => {
    const total = counts.reduce((acc, row) => acc + row[s], 0);
    const floored = counts.map((row) => row[s] / total + MISTAP_FLOOR);
    const sum = floored.reduce((a, b) => a + b, 0);
    return floored.map((p) => p / sum);
  });
  return SEASONS.map((_, k) => bySign.map((row) => row[k]));
}

const LIKELIHOODS = seasonLikelihoods();

export const HINT_QUESTION: Question = {
  id: HINT_QUESTION_ID,
  kind: "hint",
  type: "single",
  category: "絕招",
  text: "你的生日在哪個季節？",
  options: SEASONS.map((x) => ({ id: `${HINT_QUESTION_ID}_${x.key}`, text: x.text })),
  weights: Object.fromEntries(SEASONS.map((x, k) => [`${HINT_QUESTION_ID}_${x.key}`, LIKELIHOODS[k]])),
  info_gain_est_bits: 0,
  top3_discriminative: [],
};

export const isHint = (q: Question): boolean => q.kind === "hint";

/** 回答絕招題後還有可能的星座 */
export function hintCandidates(optionId: string): number[] {
  const w = HINT_QUESTION.weights[optionId] ?? [];
  return w.flatMap((p, s) => (p > 0.05 ? [s] : []));
}
