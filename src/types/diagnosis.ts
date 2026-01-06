
// src/types/diagnosis.ts

// 診断結果の型定義
export interface DiagnosisResult {
  primaryType: string;
  secondaryTypes?: string[];
  factorScores?: Record<string, number>;
}

// 特性キーの型定義
export type TraitKey = "LOGIC_DETAIL" | "COMMUNICATION" | "CARE_SUPPORT";

// 条件タグの型定義
// Fix: Use union of literals for better type safety and compatibility with components
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
  | "ON_SITE"
  | "CUSTOMER_FACING";

// ユーザープロファイルの型定義
export interface UserProfile {
  traits: Record<TraitKey, number>;
  conditions: ConditionTag[];
}

// キャラクターメタデータの型定義 (Characters.ts から自動生成)
export interface CharacterMeta {
  id?: string;
  name: string;
  image: string;
  shortDescription: string;
  resultDescription: string;
  strengthKeywords?: string[];
  suitableCategories?: string[]; // category list
  suitablePersonTypeVer1?: string;
  suitablePersonTypeVer2?: string;
  suitablePersonTypeVer3?: string;
  message?: string;
  workingStyle?: string;
}

// 質問の型定義 (questions.ts から自動生成)
export interface Question {
  id: number;
  question: string;
  options: {
    id: string;
    text: string;
    traitScores: { [key: string]: number };
  }[];
}

// ジョブマスタの型定義 (jobMaster.ts から自動生成)
export interface JobMasterEntry {
  jobId: string;
  jobName: string;
  domainL0: string; // 大カテゴリ

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

  // ★ 追加項目
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

  traitAffinity: { [key: string]: number };
  // Fix: Ensure conditionAffinity uses the literal union type
  conditionAffinity: ConditionTag[];

  characterScores: { [key: string]: number };

  category: string;
}

// JobCardView表示用の型 (JobMatching.ts から生成)
export interface JobCardView extends JobMasterEntry {
  characterScore: number;
  conditionScore: number;
  totalScore: number;

  totalMatchScore?: number;
  articleUrl?: string;
  searchUrl?: string;
}

// カテゴリ単位ビュー
export interface JobDomainCardView {
  categoryName: string;
  jobs: string[];
  suitableSummary?: string;
}

// 5要素
export const FIVE_KEYS = [
  "外向性",
  "協調性",
  "誠実性",
  "神経症的傾向",
  "経験への開放性",
] as const;

export type FiveFactorKey = (typeof FIVE_KEYS)[number];

// 第二段階の条件質問の型定義
export interface ConditionQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    // Fix: tag should be ConditionTag
    tag?: ConditionTag;
  }[];
}

// 職種スコア (JobMatching.ts で使用)
export interface JobScore {
  job: JobMasterEntry;
  characterScore: number;
  conditionScore: number;
  totalScore: number;
}

// 第二段階画面への遷移 state（任意だが型として用意）
export interface SecondStageNavState {
  rankedJobs: JobCardView[];
  userProfile: UserProfile;
  firstStageCategoryKeys: string[]; // ★第1段階で表示したカテゴリキー
}

export interface SecondStageNavState {
  rankedJobs: JobCardView[];
  userProfile: UserProfile;
  diagnosisResult: DiagnosisResult;

  // 第一段階で表示したカテゴリキー（domainL0優先、なければcategory）
  firstStageCategoryKeys: string[];
}
