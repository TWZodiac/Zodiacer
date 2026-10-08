export type ZodiacSign =
  | "牡羊" | "金牛" | "雙子" | "巨蟹"
  | "獅子" | "處女" | "天秤" | "天蠍"
  | "射手" | "摩羯" | "水瓶" | "雙魚";

export type Element = "火" | "土" | "風" | "水";

export interface Constellation {
  /** 星點座標，畫布 0–100 */
  stars: [number, number][];
  /** 連線，以 stars 的索引表示 */
  lines: [number, number][];
}

export interface SignProfile {
  name: ZodiacSign;
  english: string;
  element: Element;
  dates: string;
  tagline: string;
  traits: string[];
  blurb: string;
  constellation: Constellation;
}

export const SIGNS: ZodiacSign[] = [
  "牡羊", "金牛", "雙子", "巨蟹",
  "獅子", "處女", "天秤", "天蠍",
  "射手", "摩羯", "水瓶", "雙魚",
];

export const ELEMENT_COLOR: Record<Element, string> = {
  火: "var(--fire)",
  土: "var(--earth)",
  風: "var(--air)",
  水: "var(--water)",
};

export const ELEMENT_NAME: Record<Element, string> = {
  火: "火象",
  土: "土象",
  風: "風象",
  水: "水象",
};

export const SIGN_PROFILES: SignProfile[] = [
  {
    name: "牡羊", english: "Aries", element: "火", dates: "3/21 – 4/19",
    tagline: "衝第一的小火箭",
    traits: ["行動派", "直率", "好勝"],
    blurb: "想到就做，遇到挑戰反而更興奮。你的熱情會帶著大家往前衝，只是偶爾記得等等後面的人。",
    constellation: { stars: [[12, 58], [42, 40], [68, 42], [86, 54]], lines: [[0, 1], [1, 2], [2, 3]] },
  },
  {
    name: "金牛", english: "Taurus", element: "土", dates: "4/20 – 5/20",
    tagline: "懂享受的穩定派",
    traits: ["踏實", "重品味", "有耐力"],
    blurb: "好吃的、好睡的、好用的，你都分得出來。步調不急，但一旦決定了就很難動搖。",
    constellation: { stars: [[10, 22], [40, 50], [52, 60], [60, 46], [88, 20], [48, 78]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5]] },
  },
  {
    name: "雙子", english: "Gemini", element: "風", dates: "5/21 – 6/21",
    tagline: "腦袋停不下來的話題王",
    traits: ["反應快", "好奇", "多變"],
    blurb: "一個話題可以延伸出十個，什麼都想知道一點。跟你聊天從來不會冷場。",
    constellation: { stars: [[28, 12], [26, 46], [30, 84], [62, 10], [62, 46], [68, 84]], lines: [[0, 1], [1, 2], [3, 4], [4, 5], [0, 3]] },
  },
  {
    name: "巨蟹", english: "Cancer", element: "水", dates: "6/22 – 7/22",
    tagline: "最會照顧人的溫柔港灣",
    traits: ["念舊", "體貼", "顧家"],
    blurb: "身邊的人有沒有吃飽、心情好不好，你都放在心上。外殼硬硬的，裡面很柔軟。",
    constellation: { stars: [[50, 14], [50, 48], [50, 62], [24, 86], [78, 84]], lines: [[0, 1], [1, 2], [2, 3], [2, 4]] },
  },
  {
    name: "獅子", english: "Leo", element: "火", dates: "7/23 – 8/22",
    tagline: "天生自帶聚光燈",
    traits: ["自信", "大方", "愛面子"],
    blurb: "走進哪裡都很難被忽略。你慷慨又講義氣，也希望自己的努力被好好看見。",
    constellation: { stars: [[32, 16], [20, 28], [24, 44], [40, 50], [70, 52], [86, 72], [58, 72]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]] },
  },
  {
    name: "處女", english: "Virgo", element: "土", dates: "8/23 – 9/22",
    tagline: "細節控的完美主義者",
    traits: ["細心", "有條理", "可靠"],
    blurb: "別人看不到的小錯，你一眼就發現。你用實際行動照顧人，只是對自己有點太嚴格。",
    constellation: { stars: [[12, 28], [30, 40], [50, 36], [62, 54], [82, 48], [44, 62], [54, 86], [90, 72]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [5, 6], [4, 7]] },
  },
  {
    name: "天秤", english: "Libra", element: "風", dates: "9/23 – 10/23",
    tagline: "優雅的和平使者",
    traits: ["有美感", "圓融", "選擇困難"],
    blurb: "你在意公平，也在意好不好看。最擅長讓大家都舒服，只是點餐時會想很久。",
    constellation: { stars: [[50, 14], [24, 44], [76, 44], [28, 82], [72, 80]], lines: [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4]] },
  },
  {
    name: "天蠍", english: "Scorpio", element: "水", dates: "10/24 – 11/22",
    tagline: "深不見底的神祕派",
    traits: ["洞察力", "專一", "愛恨分明"],
    blurb: "你不輕易交心，一旦認定就全心投入。別人在想什麼，你常常比他們自己更早知道。",
    constellation: { stars: [[10, 24], [22, 20], [30, 34], [40, 48], [48, 62], [58, 74], [72, 82], [84, 74], [90, 58]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8]] },
  },
  {
    name: "射手", english: "Sagittarius", element: "火", dates: "11/23 – 12/21",
    tagline: "說走就走的自由靈魂",
    traits: ["樂觀", "愛冒險", "心直口快"],
    blurb: "地圖上沒去過的地方都在召喚你。你是氣氛製造機，只是很怕被綁住。",
    constellation: { stars: [[18, 62], [34, 46], [52, 50], [46, 72], [28, 78], [60, 32], [76, 50], [88, 38]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [1, 5], [5, 2], [2, 6], [6, 7]] },
  },
  {
    name: "摩羯", english: "Capricorn", element: "土", dates: "12/22 – 1/19",
    tagline: "一步一步登頂的實幹家",
    traits: ["有紀律", "負責", "目標導向"],
    blurb: "說到做到，而且做得很穩。你的溫柔藏在行動裡，需要時間才看得懂。",
    constellation: { stars: [[12, 30], [38, 56], [68, 76], [88, 40], [60, 34], [34, 30]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]] },
  },
  {
    name: "水瓶", english: "Aquarius", element: "風", dates: "1/20 – 2/18",
    tagline: "活在未來的怪咖天才",
    traits: ["獨立", "有創意", "不從眾"],
    blurb: "你的腦袋裝著別人還沒想到的點子。朋友很多，但你最需要的是自己的空間。",
    constellation: { stars: [[12, 42], [28, 30], [44, 46], [60, 30], [76, 46], [90, 34], [48, 78]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [2, 6]] },
  },
  {
    name: "雙魚", english: "Pisces", element: "水", dates: "2/19 – 3/20",
    tagline: "浪漫又敏感的夢想家",
    traits: ["共感力", "想像力", "溫柔"],
    blurb: "別人的情緒你都接得住，腦中隨時在上演電影。只要被理解，你就能給出全部的溫柔。",
    constellation: { stars: [[10, 16], [22, 14], [18, 30], [32, 48], [50, 84], [68, 56], [84, 32], [78, 20], [90, 18]], lines: [[0, 2], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 6]] },
  },
];

/** 每個星座的日期範圍 [起始月, 起始日, 結束月, 結束日]，順序同 SIGNS */
export const SIGN_RANGES: [number, number, number, number][] = [
  [3, 21, 4, 19], [4, 20, 5, 20], [5, 21, 6, 21], [6, 22, 7, 22],
  [7, 23, 8, 22], [8, 23, 9, 22], [9, 23, 10, 23], [10, 24, 11, 22],
  [11, 23, 12, 21], [12, 22, 1, 19], [1, 20, 2, 18], [2, 19, 3, 20],
];

/** 某月某日是哪個星座（索引） */
export function signOfDate(month: number, day: number): number {
  const md = month * 100 + day;
  return SIGN_RANGES.findIndex(([m1, d1, m2, d2]) => {
    const start = m1 * 100 + d1;
    const end = m2 * 100 + d2;
    return start <= end ? md >= start && md <= end : md >= start || md <= end;
  });
}

export function signIndex(sign: ZodiacSign): number {
  return SIGNS.indexOf(sign);
}
