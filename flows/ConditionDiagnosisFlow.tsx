// src/flows/ConditionDiagnosisFlow.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import ConditionQuestionScreen from "../components/ConditionQuestionScreen";
import LoadingScreen from "../components/LoadingScreen";

import {
  CONDITION_QUESTIONS,
  collectConditionTagsFromAnswers,
} from "../data/conditionQuestions";
import { getTopMatchedJobCards } from "../services/jobMatching";
import { JOB_MASTER } from "../data/jobMaster";

import { DiagnosisResult, UserProfile } from "../types/diagnosis";

type Screen = "question" | "loading";

// 開発中の挙動確認用（必要なときだけ true にしてください）
const DEBUG_MATCHING = false;

export default function ConditionDiagnosisFlow() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentScreen, setCurrentScreen] = useState<Screen>("question");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [diagnosisResult, setDiagnosisResult] =
    useState<DiagnosisResult | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // ★第1段階カテゴリキー（第2段階結果側のカテゴリ制限で使う）
  const [firstStageCategoryKeys, setFirstStageCategoryKeys] = useState<
    string[]
  >([]);

  const questionList = CONDITION_QUESTIONS;
  const totalSteps = questionList.length;

  // ★ 初期化処理が二重に走って / に飛ぶのを防ぐ
  const didInitRef = useRef(false);

  useEffect(() => {
    if (didInitRef.current) return;

    const state = location.state as
      | {
          diagnosisResult: DiagnosisResult;
          userProfile: UserProfile;
          firstStageCategoryKeys?: string[];
        }
      | null;

    if (state?.diagnosisResult && state?.userProfile) {
      setDiagnosisResult(state.diagnosisResult);
      setUserProfile(state.userProfile);
      setFirstStageCategoryKeys(state.firstStageCategoryKeys ?? []);
      setIsInitialized(true);
      didInitRef.current = true;
    } else {
      // state が無い場合はトップへ
      didInitRef.current = true;
      navigate("/", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ★初回のみ

  const handleAnswer = (optionId: string) => {
    const qid = questionList[currentQuestionIndex].id;
    const newAnswers = { ...answers, [qid]: optionId };
    setAnswers(newAnswers);

    if (currentQuestionIndex < totalSteps - 1) {
      setCurrentQuestionIndex((idx) => idx + 1);
    } else {
      setCurrentScreen("loading");
    }
  };

  // 現在回答から取れる condition tags（ローディングに入る前でも参照できるように）
  const selectedTags = useMemo(() => {
    return collectConditionTagsFromAnswers(answers);
  }, [answers]);

  const handleLoadingComplete = () => {
    if (!diagnosisResult || !userProfile) {
      console.error("Missing diagnosisResult or userProfile.");
      navigate("/", { replace: true });
      return;
    }

    // 第2段階の回答 → condition tags を UserProfile に統合
    const mergedProfile: UserProfile = {
      ...userProfile,
      conditions: Array.from(
        new Set([...(userProfile.conditions ?? []), ...(selectedTags ?? [])])
      ),
    };

    // ランキング（UIは崩さず、ロジックだけ jobMatching.ts 側で制御）
    const rankedJobs = getTopMatchedJobCards(
      mergedProfile,
      JOB_MASTER,
      diagnosisResult.primaryType,
      40
    );

    if (DEBUG_MATCHING) {
      // eslint-disable-next-line no-console
      console.log("[ConditionDiagnosisFlow] primaryType:", diagnosisResult.primaryType);
      // eslint-disable-next-line no-console
      console.log("[ConditionDiagnosisFlow] selectedTags:", selectedTags);
      // eslint-disable-next-line no-console
      console.log("[ConditionDiagnosisFlow] mergedProfile.conditions:", mergedProfile.conditions);
      // eslint-disable-next-line no-console
      console.log("[ConditionDiagnosisFlow] rankedJobs.length:", rankedJobs.length);
      // eslint-disable-next-line no-console
      console.log(
        "[ConditionDiagnosisFlow] rankedJobs sample:",
        rankedJobs.slice(0, 10).map((j) => ({
          jobName: j.jobName,
          domainL0: j.domainL0,
          category: j.category,
          totalScore: j.totalScore ?? j.totalMatchScore,
          conditionAffinity: j.conditionAffinity,
        }))
      );
      // eslint-disable-next-line no-console
      console.log("[ConditionDiagnosisFlow] firstStageCategoryKeys:", firstStageCategoryKeys);
    }

    navigate("/diagnosis/final-result", {
      state: {
        rankedJobs,
        diagnosisResult,
        userProfile: mergedProfile,
        firstStageCategoryKeys,
      },
      replace: true,
    });
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((idx) => idx - 1);
    } else {
      navigate("/diagnosis", { state: { restoreResult: true }, replace: true });
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "question":
        return (
          <ConditionQuestionScreen
            question={questionList[currentQuestionIndex]}
            currentStep={currentQuestionIndex + 1}
            totalSteps={totalSteps}
            onAnswer={handleAnswer}
            onBack={handleBack}
          />
        );
      case "loading":
        return <LoadingScreen onComplete={handleLoadingComplete} />;
      default:
        return null;
    }
  };

  if (!isInitialized) {
    return <div className="font-sans bg-[#f5f5f5] min-h-screen" />;
  }

  return (
    <div className="font-sans bg-[#f5f5f5] min-h-screen">{renderScreen()}</div>
  );
}
