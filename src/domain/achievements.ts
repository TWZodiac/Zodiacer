import type { Profile } from "./profile";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: (p: Profile) => boolean;
}

const correct = (p: Profile) => p.plays.filter((x) => x.correct === true);
const fooled = (p: Profile) => p.plays.filter((x) => x.correct === false);

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first", title: "初次觀星", description: "完成第一局", unlocked: (p) => p.plays.length >= 1 },
  { id: "read", title: "被看穿了", description: "星靈第一次猜中你", unlocked: (p) => correct(p).length >= 1 },
  { id: "fool", title: "騙過星靈", description: "讓星靈猜錯一次", unlocked: (p) => fooled(p).length >= 1 },
  { id: "quick", title: "一眼看穿", description: "星靈在 9 題內就猜中", unlocked: (p) => correct(p).some((x) => x.questions <= 9) },
  { id: "pure", title: "純粹讀心", description: "星靈沒用絕招就猜中你", unlocked: (p) => correct(p).some((x) => x.hint !== "used") },
  { id: "half", title: "半個星空", description: "圖鑑收集 6 個星座", unlocked: (p) => p.collected.length >= 6 },
  { id: "elements", title: "四象齊聚", description: "圖鑑集齊火、土、風、水", unlocked: (p) => new Set(p.collected.map((s) => s % 4)).size === 4 },
  { id: "all", title: "全星圖鑑", description: "讓星靈猜出全部 12 星座", unlocked: (p) => p.collected.length >= 12 },
  { id: "regular", title: "星空常客", description: "累積玩 10 局", unlocked: (p) => p.plays.length >= 10 },
];

export function unlockedIds(p: Profile): string[] {
  return ACHIEVEMENTS.filter((a) => a.unlocked(p)).map((a) => a.id);
}
