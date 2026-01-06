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
// ペナルティ用の定数・ヘルパー（第2段階仕様）
// ===============================

const CONDITION_MATCH_BONUS = 3;
const CONDITION_MISMATCH_PENALTY = 10;

// 「ユーザーの希望タグ」と「職種側タグ」のミスマッチ組み合わせ
const CONDITION_MISMATCH_RULES: { user: ConditionTag; job: ConditionTag }[] = [
  // 座り仕事希望 vs 動きが多い仕事
  { user: "SITTING_WORK", job: "ACTIVE_WORK" },
  { user: "SITTING_WORK", job: "CAN_MOVE_SOMETIMES" },

  // 会話少なめ希望 vs 話す要素の強い仕事
  { user: "LOW_COMMUNICATION_OK", job: "TALK_ACTIVE" },
  { user: "LOW_COMMUNICATION_OK", job: "CUSTOMER_FACING" },
];


// ===============================
// ① 職種ごとのマッチスコア計算
// ===============================

export function computeJobMatchScore(
  profile: UserProfile,
  job: JobMasterEntry,
  primaryCharacterName?: string,
  secondaryCharacterName?: string
): number {
  let score = 0;

  const traitAffinity = job.traitAffinity ?? {};
  const userTraits = profile.traits ?? {};

  // 志向スコア × 職種側の相性
  (Object.keys(userTraits) as TraitKey[]).forEach((key) => {
    const userVal = userTraits[key] ?? 0;
    const jobVal = traitAffinity[key] ?? 0;
    score += userVal * (jobVal / 50);
  });

  // 条件タグのマッチング
  const jobConditions = job.conditionAffinity ?? [];
  const userConditions = profile.conditions ?? [];

  let conditionMatchCount = 0;
  userConditions.forEach((uc) => {
    if (jobConditions.includes(uc)) {
      conditionMatchCount += 1;
    }
  });

  score += conditionMatchCount * CONDITION_MATCH_BONUS;

  // ★ ミスマッチペナルティロジック（第2段階仕様） ★
  let mismatchPenalty = 0;

  CONDITION_MISMATCH_RULES.forEach((rule) => {
    if (
      userConditions.includes(rule.user) &&
      jobConditions.includes(rule.job)
    ) {
      mismatchPenalty += CONDITION_MISMATCH_PENALTY;
    }
  });

  score -= mismatchPenalty;


  // ★ キャラクタースコアを加点
  if (primaryCharacterName) {
    const pScore = job.characterScores?.[primaryCharacterName] ?? 0;
    score += pScore * 1.0;
  }
  
  if (secondaryCharacterName) {
    const sScore = job.characterScores?.[secondaryCharacterName] ?? 0;
    score += sScore * 0.6;
  }

  return score;
}

// ===============================
// ② ベストマッチ職種の選定（単一）
// ===============================

export function selectBestJobForProfile(
  profile: UserProfile,
  jobs: JobMasterEntry[],
  primaryCharacterName?: string
): { job: JobMasterEntry | null; score: number } {
  if (!jobs.length) {
    return { job: null, score: 0 };
  }

  let bestJob: JobMasterEntry | null = null;
  let bestScore = -Infinity;

  jobs.forEach((job) => {
    const s = computeJobMatchScore(profile, job, primaryCharacterName);
    if (s > bestScore) {
      bestScore = s;
      bestJob = job;
    }
  });

  return {
    job: bestJob,
    score: bestScore === -Infinity ? 0 : bestScore,
  };
}

// ===============================
// ③ カード表示用整形
// ===============================

export function toJobCardView(
  job: JobMasterEntry,
  totalMatchScore?: number
): JobCardView {
  return {
    ...job, // 元の職種データのプロパティをすべてコピー
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
// ④ 1件だけカードを返すヘルパー
// ===============================

export function getBestMatchedJobCard(
  profile: UserProfile,
  jobs: JobMasterEntry[],
  primaryCharacterName?: string
): JobCardView | null {
  const { job, score } = selectBestJobForProfile(
    profile,
    jobs,
    primaryCharacterName
  );

  if (!job) return null;

  return toJobCardView(job, score);
}

// ===============================
// ⑤ 職種をランキング化
// ===============================

export function rankJobsForProfile(
  profile: UserProfile,
  jobs: JobMasterEntry[],
  primaryCharacterName?: string
): { job: JobMasterEntry; score: number }[] {
  const list: { job: JobMasterEntry; score: number }[] = jobs.map((job) => ({
    job,
    score: computeJobMatchScore(profile, job, primaryCharacterName),
  }));

  list.sort((a, b) => b.score - a.score);
  return list;
}

// ===============================
// ⑥ 上位からランダムに複数カードを返す
// ===============================

export function getTopMatchedJobCards(
  profile: UserProfile,
  jobs: JobMasterEntry[],
  primaryCharacterName?: string,
  count: number = 4
): JobCardView[] {
  
  let candidateJobs = jobs;

  // ★ 修正点: 第一段階（キャラクター診断）の結果との整合性を保つため、
  // キャラクター適性が高い上位の職種のみを候補として抽出してから、
  // 条件マッチングによる再ランキングを行う。
  if (primaryCharacterName) {
    // 1. キャラクター適性スコアで降順ソート
    const sortedByChar = [...jobs].sort((a, b) => {
      const scoreA = a.characterScores?.[primaryCharacterName] ?? 0;
      const scoreB = b.characterScores?.[primaryCharacterName] ?? 0;
      return scoreB - scoreA;
    });

    // 2. 上位60件に絞る（第一段階で表示されるカテゴリ群に寄せるため）
    // これにより、全く適性のない職種が条件だけでランクインするのを防ぐ
    candidateJobs = sortedByChar.slice(0, 60);
    
    // 3. スコア0のものは念のため除外
    candidateJobs = candidateJobs.filter(j => (j.characterScores?.[primaryCharacterName] ?? 0) > 0);
  }

  // 4. 絞り込んだ候補の中で、条件マッチを含めた総合スコア計算を行う
  const ranked = rankJobsForProfile(profile, candidateJobs, primaryCharacterName);

  if (!ranked.length) return [];

  const positive = ranked.filter((r) => r.score > 0);
  const base = positive.length ? positive : ranked;

  const poolSize = Math.min(base.length, Math.max(count * 3, 30));
  const pool = base.slice(0, poolSize);

  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count).map((entry) =>
    toJobCardView(entry.job, entry.score)
  );
}

// ===============================
// ⑦ カテゴリ（今回は domainL0）単位ビュー
// ===============================

export function getBestJobDomainsForProfile(
  profile: UserProfile,
  jobs: JobMasterEntry[],
  primaryCharacterName?: string,
  secondaryCharacterName?: string,
  domainCount: number = 2,
  jobsPerDomain: number = 6
): JobDomainCardView[] {
  const baseJobs: JobMasterEntry[] = jobs; 

  const domainMap: Record<
    string,
    {
      jobs: { job: JobMasterEntry; score: number }[];
      totalScore: number;
    }
  > = {};

  baseJobs.forEach((job) => {
    const categoryName = job.domainL0 || job.category || "その他";
    const s = computeJobMatchScore(profile, job, primaryCharacterName, secondaryCharacterName);

    if (!domainMap[categoryName]) {
      domainMap[categoryName] = { jobs: [], totalScore: 0 };
    }
    domainMap[categoryName].jobs.push({ job, score: s });
    domainMap[categoryName].totalScore += s;
  });

  const rankedDomains = Object.entries(domainMap)
    .map(([categoryName, info]) => ({ categoryName, ...info }))
    .sort((a, b) => b.totalScore - a.totalScore);

  return rankedDomains.slice(0, domainCount).map((domain) => {
    const sortedJobs = domain.jobs.sort((a, b) => b.score - a.score);

    const names = sortedJobs
      .slice(0, jobsPerDomain)
      .map((entry) => entry.job.jobName);

    const cat = domain.categoryName;

    return {
      categoryName: cat,
      jobs: names,
      suitableSummary: CATEGORY_REASON_TEXTS[cat],
    };
  });
}

// ===============================
// ⑧ 新規追加: 診断結果全体を使ったマッチング
// ===============================
export function getMatchedJobs(
  jobs: JobMasterEntry[],
  diagnosis: DiagnosisResult
): JobCardView[] {
  const primary = diagnosis.primaryType; 
  const secondary = diagnosis.secondaryTypes?.[0]; 

  const dummyProfile: UserProfile = {
    traits: {
      LOGIC_DETAIL: 0,
      COMMUNICATION: 0,
      CARE_SUPPORT: 0,
    },
    conditions: []
  };

  const ranked = jobs.map((job) => {
    const score = computeJobMatchScore(dummyProfile, job, primary, secondary);
    return { job, score };
  });

  ranked.sort((a, b) => b.score - a.score);

  return ranked.map((entry) => 
    toJobCardView(entry.job, entry.score)
  );
}