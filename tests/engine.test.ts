import { test } from "node:test";
import assert from "node:assert/strict";
import bankJson from "../src/data/question_bank.json" with { type: "json" };
import {
  DEFAULT_CONFIG,
  bayesUpdate,
  informationGain,
  optionLeader,
  rankSigns,
  seededRandom,
  uniformPriors,
  type EngineConfig,
} from "../src/domain/engine";
import { answer, answeredCount, hintState, startRound, undo, type Round } from "../src/domain/game";
import { HINT_QUESTION, hintCandidates, isHint } from "../src/domain/hint";
import { SIGNS, signOfDate } from "../src/domain/signs";
import type { Question, QuestionBank } from "../src/domain/types";

const bank = (bankJson as unknown as QuestionBank).questions as Question[];

test("每題每個星座的選項機率總和為 1", () => {
  for (const q of [...bank, HINT_QUESTION]) {
    for (let s = 0; s < 12; s++) {
      const sum = Object.values(q.weights).reduce((acc, w) => acc + w[s], 0);
      assert.ok(Math.abs(sum - 1) < 1e-3, `題目 ${q.id} 星座 ${s} 總和 ${sum}`);
    }
    assert.deepEqual(Object.keys(q.weights).sort(), q.options.map((o) => o.id).sort(), `題目 ${q.id} 選項與權重不一致`);
  }
});

test("貝氏更新後機率仍為分布", () => {
  const p = bayesUpdate(uniformPriors(), bank[0].weights[bank[0].options[0].id], 1);
  assert.ok(Math.abs(p.reduce((a, b) => a + b, 0) - 1) < 1e-9);
});

test("資訊增益非負", () => {
  for (const q of bank) assert.ok(informationGain(uniformPriors(), q, DEFAULT_CONFIG.stereotype) >= 0);
});

test("每個星座都至少是某些選項的代表", () => {
  const leaders = new Set<number>();
  for (const q of bank) for (const w of Object.values(q.weights)) leaders.add(optionLeader(w).sign);
  assert.equal(leaders.size, 12);
});

test("日期對應星座正確（含跨年的摩羯）", () => {
  assert.equal(SIGNS[signOfDate(3, 21)], "牡羊");
  assert.equal(SIGNS[signOfDate(3, 20)], "雙魚");
  assert.equal(SIGNS[signOfDate(12, 31)], "摩羯");
  assert.equal(SIGNS[signOfDate(1, 19)], "摩羯");
  assert.equal(SIGNS[signOfDate(1, 20)], "水瓶");
});

test("季節透視：春天只剩雙魚、牡羊、金牛、雙子", () => {
  const spring = HINT_QUESTION.options[0].id;
  assert.deepEqual(hintCandidates(spring).map((s) => SIGNS[s]).sort(), ["牡羊", "金牛", "雙子", "雙魚"].sort());
});

test("撤銷會回到上一題與上一個機率", () => {
  const rng = seededRandom(1);
  const r0 = startRound(bank, rng);
  const r1 = answer(r0, r0.current!.options[0].id, bank, rng);
  const back = undo(r1);
  assert.equal(back.current!.id, r0.current!.id);
  assert.deepEqual(back.priors, r0.priors);
});

/** 輪流選不同選項作答（像個難猜的玩家），直到 stop 成立或結束 */
function answerUntil(round: Round, rng: () => number, stop: (r: Round) => boolean): Round {
  while (!round.done && !stop(round)) {
    const options = round.current!.options;
    round = answer(round, options[round.steps.length % options.length].id, bank, rng);
  }
  return round;
}

test("絕招：答滿 8 題還沒把握才出現，而且一局只出現一次", () => {
  const rng = seededRandom(3);
  const atHint = answerUntil(startRound(bank, rng), rng, (r) => isHint(r.current!));
  assert.ok(isHint(atHint.current!), "應該要出現絕招題");
  assert.ok(answeredCount(atHint) >= DEFAULT_CONFIG.hintAfter!);
  assert.ok(Math.max(...atHint.priors) < DEFAULT_CONFIG.confidence);

  const after = answer(atHint, atHint.current!.options[0].id, bank, rng);
  assert.equal(hintState(after.steps), "used");
  const end = answerUntil(after, rng, () => false);
  assert.equal(end.steps.filter((s) => isHint(s.question)).length, 1);
});

test("拒絕絕招不改變機率，之後也不會再問", () => {
  const rng = seededRandom(3);
  const atHint = answerUntil(startRound(bank, rng), rng, (r) => isHint(r.current!));
  const refused = answer(atHint, null, bank, rng);
  assert.deepEqual(refused.priors, atHint.priors);
  assert.equal(hintState(refused.steps), "refused");
  const end = answerUntil(refused, rng, () => false);
  assert.equal(end.steps.filter((s) => isHint(s.question)).length, 1);
});

test("關掉絕招時一局只出題庫裡的題目", () => {
  const rng = seededRandom(5);
  const config: EngineConfig = { ...DEFAULT_CONFIG, hintAfter: null };
  let round = startRound(bank, rng, config);
  while (!round.done) round = answer(round, round.current!.options[0].id, bank, rng, config);
  assert.equal(hintState(round.steps), "none");
});

test("一局會在題數上限內結束，且不重複出題", () => {
  const rng = seededRandom(7);
  const round = answerUntil(startRound(bank, rng), rng, () => false);
  const ids = round.steps.map((s) => s.question.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(answeredCount(round) <= DEFAULT_CONFIG.maxQuestions);
});

function sample(probs: number[], r: number): number {
  for (let i = 0; i < probs.length; i++) {
    r -= probs[i];
    if (r <= 0) return i;
  }
  return probs.length - 1;
}

/**
 * 模擬玩家：stereotype 的機率照自己星座的刻板印象作答，否則像一般人（12 星座平均）；
 * 絕招題照實回答生日季節。
 */
function simulate(sign: number, stereotype: number, seed: number, config: EngineConfig = DEFAULT_CONFIG) {
  const rng = seededRandom(seed);
  const answerRng = seededRandom(seed * 31 + 5);
  let month = 0;
  let day = 0;
  do {
    month = 1 + Math.floor(answerRng() * 12);
    day = 1 + Math.floor(answerRng() * 28);
  } while (signOfDate(month, day) !== sign);
  const season = [3, 4, 5].includes(month) ? 0 : [6, 7, 8].includes(month) ? 1 : [9, 10, 11].includes(month) ? 2 : 3;

  let round = startRound(bank, rng, config);
  while (!round.done) {
    const q = round.current!;
    let chosen: string;
    if (isHint(q)) {
      chosen = q.options[season].id;
    } else {
      const probs = q.options.map((o) => {
        const w = q.weights[o.id];
        return stereotype * w[sign] + (1 - stereotype) * (w.reduce((a, b) => a + b, 0) / 12);
      });
      chosen = q.options[sample(probs, answerRng())].id;
    }
    round = answer(round, chosen, bank, rng, config);
  }
  const ranked = rankSigns(round.priors);
  return { top1: ranked[0] === sign, top3: ranked.slice(0, 3).includes(sign) };
}

function hitRates(stereotype: number, config: EngineConfig = DEFAULT_CONFIG, runs = 30) {
  let top1 = 0;
  let top3 = 0;
  for (let s = 0; s < 12; s++) {
    for (let i = 0; i < runs; i++) {
      const r = simulate(s, stereotype, s * 1000 + i + 1, config);
      top1 += +r.top1;
      top3 += +r.top3;
    }
  }
  const n = runs * 12;
  return { top1: top1 / n, top3: top3 / n };
}

test("模擬玩家：有絕招時，只有一半像自己星座的人也常被猜中", () => {
  const pct = (x: number) => `${(x * 100).toFixed(0)}%`;
  const textbook = hitRates(1);
  const half = hitRates(0.5);
  const pureHalf = hitRates(0.5, { ...DEFAULT_CONFIG, hintAfter: null });
  console.log(
    `完全像：猜中 ${pct(textbook.top1)}／前三 ${pct(textbook.top3)}；` +
      `一半像：猜中 ${pct(half.top1)}／前三 ${pct(half.top3)}；` +
      `一半像但不用絕招：猜中 ${pct(pureHalf.top1)}`,
  );
  assert.ok(textbook.top1 > 0.65);
  assert.ok(half.top1 > 0.45);
  assert.ok(half.top3 > 0.85);
  assert.ok(half.top1 > pureHalf.top1 + 0.15, "絕招應該明顯提高猜中率");
});
