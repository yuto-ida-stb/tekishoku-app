// src/types/diagnosis.ts

// ===============================
// 診断結果の型定義
// ===============================
export interface DiagnosisResult {
  primaryType: string;
  secondaryTypes?: string[];
  factorScores?: Record<string, number>;
}

// ===============================
// 特性キー（第1段階）
// ===============================
export type TraitKey = "LOGIC_DETAIL" | "COMMUNICATION" | "CARE_SUPPORT";

// ===============================
// 条件タグ（第2段階）
// ※ string のままだとタイポが検出できずロジックが壊れやすいので union で固定
// ===============================
export type ConditionTag =
  | "REMOTE_OK"
  | "HYBRID_OK"
  | "SHORT_HOURS_OK"
  | "FLEXIBLE_SHIFT"
  | "FULL_TIME_ORIENTED"
  | "LOW_COMMUNICATION_OK"
  | "TALK_ACTIVE"
  | "SITTING_WORK"
  | "CAN_MOVE_SOMETIMES"
  | "ACTIVE_WORK"
  | "LOW_STRESS"
  | "SKILL_BUILDING"
  | "HELPING_PEOPLE"
  // jobMaster 側で使っている運用タグ（質問側で選ばれなくても職種側に付く）
  | "ON_SITE"
  | "CUSTOMER_FACING";

// ===============================
// ユーザープロファイル
// ===============================
export interface UserProfile {
  traits: Record<TraitKey, number>;
  conditions: ConditionTag[];
}

// ===============================
// キャラクターメタデータ
// ===============================
export interface CharacterMeta {
  id?: string;
  name: string;
  image: string;
  shortDescription: string;
  resultDescription: string;
  strengthKeywords?: string[];
  suitableCategories?: string[];
  suitablePersonTypeVer1?: string;
  suitablePersonTypeVer2?: string;
  suitablePersonTypeVer3?: string;
  message?: string;
  workingStyle?: string;
}

// ===============================
// 質問（第1段階）
// ===============================
export interface Question {
  id: number;
  question: string;
  options: {
    id: string;
    text: string;
    traitScores: { [key: string]: number };
  }[];
}

// ===============================
// ジョブマスタ
// ===============================
export interface JobMasterEntry {
  jobId: string;
  jobName: string;
  domainL0: string;

  jobDescription: string;
  skillsSummary: string;
  suitablePersonType: string;
  notSuitablePersonType: string;
  requiredTraits: string;

  synonyms: string;
  qualificationTags: string;
  employmentType: string;
  housewifeTag: string;
  noExperienceTag: string;
  shindanTagNew: string;

  search: string;
  stanbyplus: string;
  rHash: string;
  salaryMap: string;

  qualificationNecessity: string;
  hasRelatedQualifications: string;
  relatedQualifications: string;
  qualificationAcquisitionPath: string;
  qualificationDifficulty: string;
  jobPlacementDifficulty: string;
  whatToStartWith: string;
  careerPathExamples: string;
  realisticForHomemakers: string;
  teleworkPossible: string;

  characterScoreTotal?: number;

  // traitAffinity は TraitKey 以外も入り得る（Big5が混ざっている）ので現状維持でOK
  traitAffinity: { [key: string]: number };

  // ★重要：ConditionTag[] にする（ロジックと型を一致させる）
  conditionAffinity: ConditionTag[];

  characterScores: { [key: string]: number };

  category: string;
}

// ===============================
// JobCard表示用
// ===============================
export interface JobCardView extends JobMasterEntry {
  characterScore: number;
  conditionScore: number;
  totalScore: number;
  totalMatchScore?: number;
  articleUrl?: string;
  searchUrl?: string;
}

// ===============================
// カテゴリ単位ビュー
// ===============================
export interface JobDomainCardView {
  categoryName: string;
  jobs: string[];
  suitableSummary?: string;
}

// ===============================
// 5要素（Big5）
// ===============================
export const FIVE_KEYS = [
  "外向性",
  "協調性",
  "誠実性",
  "神経症的傾向",
  "経験への開放性",
] as const;

export type FiveFactorKey = (typeof FIVE_KEYS)[number];

// ===============================
// 第二段階の条件質問
// ===============================
export interface ConditionQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    // ★ConditionTag に統一（conditionQuestions.ts の tag と一致させる）
    tag?: ConditionTag;
  }[];
}

// ===============================
// 職種スコア
// ===============================
export interface JobScore {
  job: JobMasterEntry;
  characterScore: number;
  conditionScore: number;
  totalScore: number;
}
