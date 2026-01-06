
// src/utils/profileBuilder.ts

import { TraitKey, ConditionTag, UserProfile } from "../types/diagnosis";
import { answerWeights } from "../data/answerWeights";

// ① Traitスコア集計（Q1〜18のうち、answerWeights があるものだけ加算）
export function buildTraitScores(
  answers: Record<number, string>
): Record<TraitKey, number> {
  const result: Record<TraitKey, number> = {
    LOGIC_DETAIL: 0,
    COMMUNICATION: 0,
    CARE_SUPPORT: 0,
  };

  Object.entries(answers).forEach(([qidStr, optId]) => {
    const qid = String(qidStr);

    const weightSet = answerWeights[qid];
    if (!weightSet) return;

    const weight = weightSet[optId as string];
    if (!weight) return;

    Object.entries(weight).forEach(([key, value]) => {
      result[key as TraitKey] += value ?? 0;
    });
  });

  return result;
}

// ② ConditionTag 抽出（Q15〜18）
export function buildConditionTags(
  answers: Record<number, string>
): ConditionTag[] {
  const tags: ConditionTag[] = [];

  // Q15：興味のある仕事は？
  switch (answers[15]) {
    case "A":
      // 落ち着いた環境でできる仕事
      // Fix: Map "PC_ENV" and "QUIET_OK" to valid ConditionTag values
      tags.push("SITTING_WORK", "LOW_COMMUNICATION_OK");
      break;
    case "B":
      // 人と関わりが多い環境
      // Fix: Map "TALKATIVE" to valid ConditionTag "TALK_ACTIVE"
      tags.push("CUSTOMER_FACING", "TALK_ACTIVE");
      break;
    case "C":
      // 誰かの役に立てたと実感できる仕事
      // Fix: Map "CARE_FIELD" to valid ConditionTag "HELPING_PEOPLE"
      tags.push("HELPING_PEOPLE");
      break;
  }

  // Q16：体力に自信はある？
  switch (answers[16]) {
    case "A":
      // 体を動かしている方が好き
      // Fix: Map "STANDING_OK" to valid ConditionTag "ACTIVE_WORK"
      tags.push("ACTIVE_WORK", "CAN_MOVE_SOMETIMES");
      break;
    case "B":
      // 立ち仕事は少ない方がいい → 立ち仕事を避けたいフラグ
      // Fix: Map "AVOID_STANDING" to valid ConditionTag "SITTING_WORK" and "QUIET_OK" to "LOW_COMMUNICATION_OK"
      tags.push("SITTING_WORK", "LOW_COMMUNICATION_OK");
      break;
    case "C":
      // 気分転換に動ける仕事がいい
      tags.push("CAN_MOVE_SOMETIMES");
      break;
  }

  // Q17：希望の働き方は？
  switch (answers[17]) {
    case "A":
      // Fix: Map "SHORT_TIME" to valid ConditionTag "SHORT_HOURS_OK"
      tags.push("SHORT_HOURS_OK");
      break;
    case "B":
      // Fix: Map "STABLE_SHIFT" to valid ConditionTag "FULL_TIME_ORIENTED" (as opposite of flexible)
      tags.push("FULL_TIME_ORIENTED");
      break;
    case "C":
      tags.push("FLEXIBLE_SHIFT");
      break;
  }

  // Q18：人と話すことは得意？
  switch (answers[18]) {
    case "A":
      // 話すのが得意ではない → 静かな環境OK
      // Fix: Map "QUIET_OK" to valid ConditionTag "LOW_COMMUNICATION_OK"
      tags.push("LOW_COMMUNICATION_OK");
      break;
    case "B":
      // Fix: Map "TALKATIVE" to valid ConditionTag "TALK_ACTIVE"
      tags.push("TALK_ACTIVE", "CUSTOMER_FACING");
      break;
    case "C":
      tags.push("CUSTOMER_FACING");
      break;
  }

  // 重複除去
  return Array.from(new Set(tags));
}

// ③ UserProfile 全体
export function buildUserProfile(
  answers: Record<number, string>
): UserProfile {
  return {
    traits: buildTraitScores(answers),
    conditions: buildConditionTags(answers),
  };
}
