import { test } from "node:test";
import assert from "node:assert/strict";
import bankJson from "../src/data/question_bank.json" with { type: "json" };
import { bayesUpdate, informationGain, optionLeader, seededRandom, uniformPriors } from "../src/domain/engine";
import { answer, answeredCount, startRound, undo } from "../src/domain/game";
import type { Question, QuestionBank } from "../src/domain/types";

const bank = (bankJson as unknown as QuestionBank).questions as Question[];

test("每題每個星座的選項機率總和為 1", () => {
  for (const q of bank) {
    for (let s = 0; s < 12; s++) {
      const sum = Object.values(q.weights).reduce((acc, w) => acc + w[s], 0);
      assert.ok(Math.abs(sum - 1) < 1e-3, `題目 ${q.id} 星座 ${s} 總和 ${sum}`);
    }
    assert.deepEqual(Object.keys(q.weights).sort(), q.options.map((o) => o.id).sort(), `題目 ${q.id} 選項與權重不一致`);
  }
});

test("貝氏更新後機率仍為分布", () => {
  const p = bayesUpdate(uniformPriors(), bank[0].weights[bank[0].options[0].id], 0.85);
  assert.ok(Math.abs(p.reduce((a, b) => a + b, 0) - 1) < 1e-9);
});

test("資訊增益非負", () => {
  for (const q of bank) assert.ok(informationGain(uniformPriors(), q) >= 0);
});

test("每個星座都至少是某些選項的代表", () => {
  const leaders = new Set<number>();
  for (const q of bank) for (const w of Object.values(q.weights)) leaders.add(optionLeader(w).sign);
  assert.equal(leaders.size, 12);
});

test("撤銷會回到上一題與上一個機率", () => {
  const rng = seededRandom(1);
  const r0 = startRound(bank, rng);
  const r1 = answer(r0, r0.current!.options[0].id, bank, rng);
  const back = undo(r1);
  assert.equal(back.current!.id, r0.current!.id);
  assert.deepEqual(back.priors, r0.priors);
});

test("一局會在題數上限內結束，且不重複出題", () => {
  const rng = seededRandom(7);
  let round = startRound(bank, rng);
  while (!round.done) round = answer(round, round.current!.options[0].id, bank, rng);
  const ids = round.steps.map((s) => s.question.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(answeredCount(round) <= 16);
});

// 模擬「符合星座刻板印象」的玩家：依該星座的 P(選項|星座) 抽答案
function simulate(sign: number, seed: number) {
  const rng = seededRandom(seed);
  const answerRng = seededRandom(seed * 31 + 5);
  let round = startRound(bank, rng);
  while (!round.done) {
    const q = round.current!;
    let r = answerRng();
    let chosen = q.options[q.options.length - 1].id;
    for (const o of q.options) {
      r -= q.weights[o.id][sign];
      if (r <= 0) { chosen = o.id; break; }
    }
    round = answer(round, chosen, bank, rng);
  }
  const ranked = round.priors.map((p, s) => ({ p, s })).sort((a, b) => b.p - a.p).map((x) => x.s);
  return { top1: ranked[0] === sign, top3: ranked.slice(0, 3).includes(sign), questions: round.steps.length };
}

test("模擬玩家：星靈的命中率遠高於亂猜", () => {
  const runs = 40;
  let top1 = 0, top3 = 0, questions = 0;
  for (let s = 0; s < 12; s++) {
    for (let i = 0; i < runs; i++) {
      const r = simulate(s, s * 1000 + i + 1);
      top1 += +r.top1; top3 += +r.top3; questions += r.questions;
    }
  }
  const n = runs * 12;
  console.log(`模擬 ${n} 局：Top1 ${(top1 / n * 100).toFixed(1)}%，Top3 ${(top3 / n * 100).toFixed(1)}%，平均 ${(questions / n).toFixed(1)} 題`);
  assert.ok(top1 / n > 0.3, "Top1 命中率應遠高於 1/12");
  assert.ok(top3 / n > 0.6);
});
