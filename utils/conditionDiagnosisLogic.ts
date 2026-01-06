// src/utils/conditionDiagnosisLogic.ts

import { ConditionQuestion } from "../types/diagnosis";

export function calculateConditionScore(
  userAnswers: { [key: string]: string },
  conditionQuestions: ConditionQuestion[],
  jobConditionAffinity: string[]
): number {
  let score = 0;
  const userSelectedTags: string[] = [];

  // Collect all tags selected by the user
  conditionQuestions.forEach((q) => {
    const userAnswerId = userAnswers[q.id];
    if (userAnswerId) {
      const selectedOption = q.options.find((opt) => opt.id === userAnswerId);
      if (selectedOption?.tag) {
        userSelectedTags.push(selectedOption.tag);
      }
    }
  });

  // Calculate score based on matches
  userSelectedTags.forEach((userTag) => {
    if (jobConditionAffinity.includes(userTag)) {
      score += 10; // 1一致 = +10点
    }
  });

  return score;
}
