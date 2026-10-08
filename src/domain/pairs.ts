import type { Question } from "./types";

/**
 * 把多選題拆成「這個還是那個」：每兩個選項一組。
 * 只能二選一時，玩家選 A 的機率照 Luce 選擇規則換算：
 * P(A | 星座) = P(A|星座) / (P(A|星座) + P(B|星座))。
 * 一局裡同一個原題只問一次，所以星靈會挑當下最能分辨的那一對。
 */
export function pairQuestions(q: Question): Question[] {
  if (q.options.length <= 2) return [q];
  const pairs: Question[] = [];
  for (let i = 0; i < q.options.length; i++) {
    for (let j = i + 1; j < q.options.length; j++) {
      const a = q.options[i];
      const b = q.options[j];
      const wa = q.weights[a.id];
      const wb = q.weights[b.id];
      pairs.push({
        ...q,
        id: q.id * 100 + i * 10 + j,
        kind: "pair",
        stem: q.id,
        options: [a, b],
        weights: {
          [a.id]: wa.map((v, s) => v / (v + wb[s])),
          [b.id]: wb.map((v, s) => v / (v + wa[s])),
        },
      });
    }
  }
  return pairs;
}

export const toPairBank = (bank: Question[]): Question[] => bank.flatMap(pairQuestions);

export const isPair = (q: Question): boolean => q.kind === "pair";

/** 題目原本是哪一題；同一題拆出來的二選一共用這個編號 */
export const stemOf = (q: Question): number => q.stem ?? q.id;
