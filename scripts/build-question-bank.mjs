// 產生 src/data/question_bank.json
// - legacy_bank_50.json：原本 50 題，沿用既有權重，補上主題分類
// - new_questions.json：新題目，用「星座+分數」標記，這裡換算成 P(選項|星座)
// 執行：npm run build:questions
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "src/data");
const SIGNS = ["牡羊", "金牛", "雙子", "巨蟹", "獅子", "處女", "天秤", "天蠍", "射手", "摩羯", "水瓶", "雙魚"];
const CATEGORIES = ["個性", "社交", "愛情", "工作", "金錢", "情緒", "生活", "美感", "冒險"];

// 選項的基礎分；分數 1–3 疊加在上面，越大代表越能區分星座
const BASE_AFFINITY = 1.5;

const LEGACY_CATEGORY = {
  1: "個性", 2: "生活", 3: "個性", 4: "社交", 5: "美感", 6: "情緒", 7: "個性", 8: "工作", 9: "情緒", 10: "情緒",
  11: "生活", 12: "愛情", 13: "工作", 14: "個性", 15: "工作", 16: "美感", 17: "愛情", 18: "金錢", 19: "生活", 20: "社交",
  21: "個性", 22: "情緒", 23: "社交", 24: "個性", 25: "愛情", 26: "社交", 27: "生活", 28: "工作", 29: "社交", 30: "社交",
  31: "金錢", 32: "愛情", 33: "工作", 34: "愛情", 35: "個性", 36: "情緒", 37: "社交", 38: "情緒", 39: "個性", 40: "愛情",
  41: "工作", 42: "愛情", 43: "情緒", 44: "個性", 45: "冒險", 46: "工作", 47: "生活", 48: "金錢", 49: "情緒", 50: "愛情",
};

const readJson = (name) => JSON.parse(readFileSync(join(dataDir, "authoring", name), "utf8"));

function parseAffinity(spec, where) {
  const scores = Array(12).fill(0);
  for (const token of spec.trim().split(/\s+/).filter(Boolean)) {
    const m = token.match(/^(.+?)([1-3])$/);
    const idx = m ? SIGNS.indexOf(m[1]) : -1;
    if (idx < 0) throw new Error(`${where}: 無法解析「${token}」`);
    scores[idx] = Number(m[2]);
  }
  return scores;
}

// 每個星座在同一題的所有選項上機率總和為 1
function normalizePerSign(weights) {
  const ids = Object.keys(weights);
  for (let s = 0; s < 12; s++) {
    const total = ids.reduce((acc, id) => acc + weights[id][s], 0);
    for (const id of ids) weights[id][s] = round(weights[id][s] / total);
  }
  return weights;
}

const round = (x) => Math.round(x * 1e6) / 1e6;

function infoGain(weights) {
  const ids = Object.keys(weights);
  let ig = 0;
  for (const id of ids) {
    const pA = weights[id].reduce((a, b) => a + b, 0) / 12;
    for (let s = 0; s < 12; s++) {
      const p = weights[id][s];
      if (p > 0) ig += (1 / 12) * p * Math.log2(p / pA);
    }
  }
  return round(ig);
}

function top3(weights) {
  const ids = Object.keys(weights);
  const spread = SIGNS.map((sign, s) => {
    const col = ids.map((id) => weights[id][s]);
    return { sign, score: Math.max(...col) - Math.min(...col) };
  });
  return spread.sort((a, b) => b.score - a.score).slice(0, 3).map((x) => x.sign);
}

const legacy = readJson("legacy_bank_50.json").questions.map((q) => ({
  id: q.id,
  type: q.type,
  category: LEGACY_CATEGORY[q.id],
  text: q.text,
  options: q.options,
  weights: normalizePerSign(structuredClone(q.weights)),
}));

const authored = readJson("new_questions.json").questions.map((q) => {
  const options = q.options.map((o, i) => ({ id: `${q.id}_${i + 1}`, text: o.text }));
  const weights = {};
  q.options.forEach((o, i) => {
    weights[options[i].id] = parseAffinity(o.signs, `題目 ${q.id}`).map((a) => BASE_AFFINITY + a);
  });
  return { id: q.id, type: q.type, category: q.category, text: q.text, options, weights: normalizePerSign(weights) };
});

const questions = [...legacy, ...authored].map((q) => {
  if (!CATEGORIES.includes(q.category)) throw new Error(`題目 ${q.id} 主題不明：${q.category}`);
  return { ...q, info_gain_est_bits: infoGain(q.weights), top3_discriminative: top3(q.weights) };
});

const ids = new Set();
for (const q of questions) {
  if (ids.has(q.id)) throw new Error(`題號重複：${q.id}`);
  ids.add(q.id);
}

questions.sort((a, b) => b.info_gain_est_bits - a.info_gain_est_bits);

const bank = { schema_version: "zodiac-quiz-qbank-v2", sign_order: SIGNS, categories: CATEGORIES, questions };
writeFileSync(join(dataDir, "question_bank.json"), JSON.stringify(bank, null, 1) + "\n");

const byCat = Object.fromEntries(CATEGORIES.map((c) => [c, questions.filter((q) => q.category === c).length]));
console.log(`寫入 ${questions.length} 題`, byCat);
