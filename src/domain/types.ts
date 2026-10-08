export type QuestionType = "boolean" | "single";

export type Category = "個性" | "社交" | "愛情" | "工作" | "金錢" | "情緒" | "生活" | "美感" | "冒險" | "絕招";

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  /**
   * "hint" 是星靈卡關時才會出現的絕招題，不在題庫裡；
   * "pair" 是從多選題拆出來的二選一（見 pairs.ts）
   */
  kind?: "hint" | "pair";
  /** 二選一題原本屬於哪一題 */
  stem?: number;
  type: QuestionType;
  category: Category;
  text: string;
  options: QuestionOption[];
  /** P(選項 | 星座)，陣列順序同 SIGNS */
  weights: Record<string, number[]>;
  info_gain_est_bits: number;
  top3_discriminative: string[];
}

export interface QuestionBank {
  schema_version: string;
  sign_order: string[];
  categories: Category[];
  questions: Question[];
}

export interface Answer {
  questionId: number;
  /** null 代表跳過 */
  optionId: string | null;
}
