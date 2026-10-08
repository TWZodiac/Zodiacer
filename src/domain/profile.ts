import type { HintState } from "./game";
import type { Answer } from "./types";

export interface PlayRecord {
  at: string;
  /** 星靈猜的星座（索引） */
  guessed: number;
  /** 玩家回報的真實星座；null 代表沒說 */
  actual: number | null;
  correct: boolean | null;
  questions: number;
  /** 舊紀錄沒有這個欄位（當時還沒有絕招） */
  hint?: HintState;
  priors: number[];
  answers: Answer[];
}

export interface Profile {
  version: 1;
  plays: PlayRecord[];
  /** 已收進圖鑑的星座（星靈猜出過的） */
  collected: number[];
}

export const emptyProfile = (): Profile => ({ version: 1, plays: [], collected: [] });

export function addPlay(profile: Profile, play: PlayRecord): Profile {
  const collected = profile.collected.includes(play.guessed) ? profile.collected : [...profile.collected, play.guessed];
  return { ...profile, plays: [...profile.plays, play], collected };
}

export function updateLastPlay(profile: Profile, actual: number | null): Profile {
  if (profile.plays.length === 0) return profile;
  const plays = [...profile.plays];
  const last = plays[plays.length - 1];
  plays[plays.length - 1] = { ...last, actual, correct: actual === null ? null : actual === last.guessed };
  return { ...profile, plays };
}

export function hitRate(profile: Profile): number | null {
  const judged = profile.plays.filter((p) => p.correct !== null);
  if (judged.length === 0) return null;
  return judged.filter((p) => p.correct).length / judged.length;
}
