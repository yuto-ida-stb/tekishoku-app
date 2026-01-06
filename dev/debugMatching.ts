// src/dev/debugMatching.ts

import { buildUserProfile } from "../utils/profileBuilder";
import { UserProfile, JobMasterEntry } from "../types/diagnosis";
import { computeJobMatchScore } from "../services/jobMatching";

type DebugParams = {
  answers: Record<number, string>;
  jobs: JobMasterEntry[];
  focusJobNames?: string[];
};

/**
 * 「立ち仕事は少ない方がいい」などの条件回答と
 * 実際の職種スコア・conditionAffinity を可視化するためのデバッグ関数
 */
export function debugAvoidStandingScenario({
  answers,
  jobs,
  focusJobNames,
}: DebugParams) {
  const profile: UserProfile = buildUserProfile(answers);

  const targetJobs = focusJobNames?.length
    ? jobs.filter((j) => focusJobNames.includes(j.jobName))
    : jobs;

  console.group("🔍 Debug AVOID_STANDING scenario");
  console.log("✅ profile.conditions:", profile.conditions);
  console.log("✅ profile.traits:", profile.traits);

  targetJobs.forEach((job) => {
    const score = computeJobMatchScore(profile, job);
    console.log(`--- ${job.jobName} ---`);
    console.log("  totalScore:", score);
    console.log("  conditionAffinity:", job.conditionAffinity);
    console.log("  traitAffinity:", job.traitAffinity);
  });

  console.groupEnd();
}
