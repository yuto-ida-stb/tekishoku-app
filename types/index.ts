export interface Question {
  id: number;
  text: string;
  options: {
    value: string;
    label: string;
    scores: { [key: string]: number };
  }[];
}

export interface JobType {
  // （これは第2段階の絞り込みで使われるCSVの型定義だと思われるため、一旦そのまま維持します）
  name: string;
  requiredSkills: string[];
  advantageousSkills: string[];
  certificates: string[];
  shindan_tag: string;
  work_setting?: string;
  schedule_type?: string;
}

export interface RecommendedJob {
  title: string;
  skills: {
    utilize: string;
    required: string;
    advantageous: string;
  };
  articleUrl: string;
  searchUrl: string;
}

export interface DiagnosisType {
  name: string;
  image: string;
  description: string;
  recommendedJobs: RecommendedJob[];
  keywords?: string[];          // 既存が空配列でもOK。未設定でも通るよう optional に
  strengthKeywords?: string[];  // ★ 追加：まずは optional にしておきます
}

export interface DiagnosisResult {
  primaryType: string;
  secondaryTypes: string[];
  scores: { [key: string]: number };
  factorScores: { [key: string]: number };
}

export interface WorkPreferences {
  environment: string;
  workLifeBalance: string;
  learningStyle: string;
  workStyle: string;
  relationships: string;
  motivation: string;
}

export const FIVE_KEYS = [
  "コツコツ実行力",
  "チームサポート力",
  "共感コミュ力",
  "アイデア創造力",
  "段取り&分析力",
] as const;
export type FiveKey = typeof FIVE_KEYS[number];

// 各因子スコア（0〜任意の整数）
export type FiveScores = Record<FiveKey, number>;

// 回答形式（単一 or リッカート）
export type Answer =
  | { id: string; type: "single"; value: string }   // value は選択肢キー
  | { id: string; type: "likert"; value: string };  // value は尺度キー

// 各設問のスコアベクトル
export type FiveVec = Partial<Record<FiveKey, number>>;

// 質問構造（既存との共存OK）
export type QuestionConfig =
  | { id: string; type: "single"; options: Record<string, FiveVec> }
  | { id: string; type: "likert"; target: FiveVec; scale: Record<string, number> };

  export * from "./diagnosis";
