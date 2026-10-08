import { answerAffinity } from "./engine";
import { isHint } from "./hint";
import type { Step } from "./game";

export interface AnswerInsight {
  questionText: string;
  optionText: string;
  /** log2 倍率；正值越大越像該星座，負值越小越不像 */
  affinity: number;
}

/** 找出最像、最不像某個星座的回答 */
export function signInsights(steps: Step[], sign: number): { alike: AnswerInsight[]; unlike: AnswerInsight[] } {
  const scored: AnswerInsight[] = steps
    .filter((s) => s.optionId !== null && !isHint(s.question))
    .map((s) => ({
      questionText: s.question.text,
      optionText: s.question.options.find((o) => o.id === s.optionId)?.text ?? "",
      affinity: answerAffinity(s.question.weights[s.optionId as string], sign),
    }));
  const sorted = [...scored].sort((a, b) => b.affinity - a.affinity);
  return {
    alike: sorted.filter((x) => x.affinity > 0.15).slice(0, 3),
    unlike: sorted.reverse().filter((x) => x.affinity < -0.15).slice(0, 2),
  };
}
