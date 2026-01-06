// src/services/jobMatching.ts

import { DiagnosisResult } from "../types";
import {
  UserProfile,
  JobMasterEntry,
  JobCardView,
  TraitKey,
  ConditionTag,
  JobDomainCardView,
} from "../types/diagnosis";
import { CATEGORY_REASON_TEXTS } from "../data/categoryReasonTexts";

// ===============================
// ロジック用定数
// ===============================
// キャラクター適性を最優先するため、圧倒的な基礎点を設定
const CHARACTER_BASE_FACTOR = 10000;      
const SECONDARY_CHARACTER_FACTOR = 1000; 
const CONDITION_BOOST_SCORE = 500;       // 条件一致は「同じ才能の中での優先度」として機能
const ABSOLUTE_EXCLUSION_SCORE = -1000000; 

// -------------------------------
// ハードミスマッチ（絶対に無理な仕事）の判定
// -------------------------------
function isHardMismatch(
  userConditions: ConditionTag[],
  jobConditions: ConditionTag[]
): boolean {
  // 1. 在宅希望なのに現場必須
  if (userConditions.includes("REMOTE_OK") && jobConditions.includes("ON_SITE")) {
    return true;
  }
  // 2. 会話少なめ希望なのに「会話多め」または「接客あり」
  if (userConditions.includes("LOW_COMMUNICATION_OK")) {
    if (jobConditions.includes("TALK_ACTIVE") || jobConditions.includes("CUSTOMER_FACING")) {
      return true;
    }
  }
  // 3. 座り仕事希望なのに「動きあり」
  if (userConditions.includes("SITTING_WORK") && jobConditions.includes("ACTIVE_WORK")) {
    return true;
  }
  return false;
}

// ===============================
// ① 職種ごとのマッチスコア計算
// ===============================
export function computeJobMatchScore(
  profile: UserProfile,
  job: JobMasterEntry,
  primaryCharacterName?: string,
  secondaryCharacterName?: string
): number {
  // --- A. キャラクター適性チェック（足切り） ---
  const pScore = primaryCharacterName ? (job.characterScores?.[primaryCharacterName] ?? 0) : 0;
  const sScore = secondaryCharacterName ? (job.characterScores?.[secondaryCharacterName] ?? 0) : 0;

  // 主キャラクターの適性が0、または非常に低い職種は候補に出さない（才能第一）
  if (pScore <= 0) return ABSOLUTE_EXCLUSION_SCORE;

  // --- B. ハードミスマッチ（条件除外） ---
  const userConditions = profile.conditions ?? [];
  const jobConditions = job.conditionAffinity ?? [];
  if (isHardMismatch(userConditions, jobConditions)) {
    return ABSOLUTE_EXCLUSION_SCORE;
  }

  // --- C. スコア計算開始 ---
  // キャラクター適性を圧倒的な基礎点にする
  let score = (pScore * CHARACTER_BASE_FACTOR) + (sScore * SECONDARY_CHARACTER_FACTOR);

  // トレイトAffinity（志向性）の加算
  const traitAffinity = job.traitAffinity ?? {};
  const userTraits = profile.traits ?? {};
  (Object.keys(userTraits) as TraitKey[]).forEach((key) => {
    const userVal = userTraits[key] ?? 0;
    const jobVal = traitAffinity[key] ?? 0;
    score += userVal * (jobVal / 100);
  });

  // --- D. 条件ブースト ---
  // 才能が合う候補の中から、希望に合うものを上位へ引き上げる
  userConditions.forEach((uc) => {
    if (jobConditions.includes(uc)) {
      score += CONDITION_BOOST_SCORE;
    }
  });

  return score;
}

// ===============================
// ② カード表示用整形
// ===============================
export function toJobCardView(
  job: JobMasterEntry,
  totalMatchScore?: number
): JobCardView {
  return {
    ...job,
    category: job.category || job.domainL0,
    characterScore: 0,
    conditionScore: 0,
    totalScore: totalMatchScore ?? 0,
    articleUrl: job.stanbyplus || job.salaryMap,
    searchUrl: job.search || job.rHash,
    totalMatchScore,
  };
}

// ===============================
// ③ 職種をランキング化
// ===============================
export function rankJobsForProfile(
  profile: UserProfile,
  jobs: JobMasterEntry[],
  primaryCharacterName?: string,
  secondaryCharacterName?: string
): { job: JobMasterEntry; score: number }[] {
  const list = jobs
    .map((job) => ({
      job,
      score: computeJobMatchScore(profile, job, primaryCharacterName, secondaryCharacterName),
    }))
    .filter((item) => item.score > 0);

  list.sort((a, b) => b.score - a.score);
  return list;
}

// ===============================
// ④ 上位から複数カードを返す
// ===============================
export function getTopMatchedJobCards(
  profile: UserProfile,
  jobs: JobMasterEntry[],
  primaryCharacterName?: string,
  count: number = 40
): JobCardView[] {
  const ranked = rankJobsForProfile(profile, jobs, primaryCharacterName);
  return ranked.slice(0, count).map((entry) => toJobCardView(entry.job, entry.score));
}

// ===============================
// ⑤ カテゴリ単位ビュー
// ===============================
export function getBestJobDomainsForProfile(
  profile: UserProfile,
  jobs: JobMasterEntry[],
  primaryCharacterName?: string,
  secondaryCharacterName?: string,
  domainCount: number = 2,
  jobsPerDomain: number = 6
): JobDomainCardView[] {
  const rankedJobs = rankJobsForProfile(profile, jobs, primaryCharacterName, secondaryCharacterName);

  const domainMap: Record<
    string,
    { jobs: { job: JobMasterEntry; score: number }[]; topScore: number }
  > = {};

  rankedJobs.forEach((item) => {
    const categoryName = (item.job.domainL0 || item.job.category || "その他").trim();
    if (!domainMap[categoryName]) {
      domainMap[categoryName] = { jobs: [], topScore: item.score };
    }
    domainMap[categoryName].jobs.push(item);
  });

  const rankedDomains = Object.entries(domainMap)
    .map(([categoryName, info]) => ({ categoryName, ...info }))
    .sort((a, b) => b.topScore - a.topScore);

  return rankedDomains.slice(0, domainCount).map((domain) => {
    const names = domain.jobs
      .slice(0, jobsPerDomain)
      .map((entry) => entry.job.jobName);

    return {
      categoryName: domain.categoryName,
      jobs: names,
      suitableSummary: CATEGORY_REASON_TEXTS[domain.categoryName],
    };
  });
}

// ===============================
// ⑥ 診断結果全体を使ったマッチング（第1段階用）
// ===============================
export function getMatchedJobs(
  jobs: JobMasterEntry[],
  diagnosis: DiagnosisResult
): JobCardView[] {
  const primary = diagnosis.primaryType;
  const secondary = diagnosis.secondaryTypes?.[0];

  const dummyProfile: UserProfile = {
    traits: { LOGIC_DETAIL: 0, COMMUNICATION: 0, CARE_SUPPORT: 0 },
    conditions: [],
  };

  const ranked = jobs
    .map((job) => ({
      job,
      score: computeJobMatchScore(dummyProfile, job, primary, secondary),
    }))
    .filter((item) => item.score > 0);

  ranked.sort((a, b) => b.score - a.score);
  return ranked.map((entry) => toJobCardView(entry.job, entry.score));
}
