import { SIGN_PROFILES, ELEMENT_NAME, type Element } from "./signs";
import { rankSigns } from "./engine";

const OPENERS = [
  "嗨，我是星靈小星！照直覺回答就好，我會試著猜出你的星座。",
  "準備好了嗎？每回答一題，星盤上就會亮起一點線索。",
];

/** 根據目前機率給一句「星靈的直覺」 */
export function hunch(priors: number[], answered: number): string {
  if (answered === 0) return OPENERS[0];
  const ranked = rankSigns(priors);
  const top = SIGN_PROFILES[ranked[0]];
  const p1 = priors[ranked[0]];
  const p2 = priors[ranked[1]];

  const elementShare: Record<Element, number> = { 火: 0, 土: 0, 風: 0, 水: 0 };
  priors.forEach((p, s) => (elementShare[SIGN_PROFILES[s].element] += p));
  const [element, share] = (Object.entries(elementShare) as [Element, number][]).sort((a, b) => b[1] - a[1])[0];

  if (p1 > 0.45) return `我越來越有把握了…該不會是${top.name}座吧？`;
  if (p1 > 0.25 && p1 - p2 < 0.05) return `${top.name}座和${SIGN_PROFILES[ranked[1]].name}座在拉鋸，再問幾題就知道！`;
  if (p1 > 0.25) return `嗯…我腦中浮現${top.name}座的身影。`;
  if (share > 0.4) return `我聞到一股${ELEMENT_NAME[element]}星座的氣息…`;
  if (answered < 3) return "還在暖身，再多給我一點線索～";
  return "你是個謎！星盤還在轉，我要更仔細看看。";
}
