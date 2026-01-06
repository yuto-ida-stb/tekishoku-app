// src/flows/DiagnosisFlow.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import QuestionScreen from "../components/QuestionScreen";
import LoadingScreen from "../components/LoadingScreen";
import ResultScreen from "../components/ResultScreen";
import JobScreen from "../components/JobScreen";

import { QUESTIONS as diagnosisQuestions } from "../data/questions";
import { DiagnosisResult } from "../types";
import { calculateDiagnosisResult } from "../utils/diagnosisLogic";

import { UserProfile } from "../types/diagnosis";
import { buildUserProfile } from "../utils/profileBuilder";

type Screen = "question" | "loading" | "result" | "jobs";

export default function DiagnosisFlow() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentScreen, setCurrentScreen] = useState<Screen>("question");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [diagnosisResult, setDiagnosisResult] =
    useState<DiagnosisResult | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const questionList = diagnosisQuestions;
  const totalSteps = questionList.length;

  const restoreFromStorage = () => {
    try {
      const storedResult = sessionStorage.getItem("diagnosisResult");
      const storedAnswers = sessionStorage.getItem("diagnosisAnswers");

      if (!storedResult || !storedAnswers) return false;

      const parsedResult: DiagnosisResult = JSON.parse(storedResult);
      const parsedAnswers: { [key: number]: string } = JSON.parse(storedAnswers);

      const profile = buildUserProfile(parsedAnswers);

      setDiagnosisResult(parsedResult);
      setAnswers(parsedAnswers);
      setUserProfile(profile);
      setCurrentScreen("result");
      return true;
    } catch (e) {
      console.error("診断結果の復元に失敗しました", e);
      return false;
    }
  };

  useEffect(() => {
    const state = location.state as { restoreResult?: boolean } | null;

    if (state?.restoreResult) {
      const ok = restoreFromStorage();
      if (!ok) {
        setCurrentScreen("question");
        setCurrentQuestionIndex(0);
      }

      navigate("/diagnosis", { replace: true, state: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

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

  const handleLoadingComplete = () => {
    const result = calculateDiagnosisResult(answers, diagnosisQuestions);
    setDiagnosisResult(result);

    const profile = buildUserProfile(answers);
    setUserProfile(profile);

    try {
      sessionStorage.setItem("diagnosisResult", JSON.stringify(result));
      sessionStorage.setItem("diagnosisAnswers", JSON.stringify(answers));
    } catch (e) {
      console.error("診断結果の保存に失敗しました", e);
    }

    setCurrentScreen("result");
  };

  // ★第二段階へ進む（ResultScreen からカテゴリキー配列を受け取る）
  const handleProceedToConditionDiagnosis = (firstStageCategoryKeys: string[]) => {
    if (!diagnosisResult || !userProfile) return;

    navigate("/diagnosis/conditions", {
      state: {
        diagnosisResult,
        userProfile,
        firstStageCategoryKeys: firstStageCategoryKeys ?? [],
      },
    });
  };

  const handleBack = () => {
    if (currentScreen === "question" && currentQuestionIndex > 0) {
      setCurrentQuestionIndex((idx) => idx - 1);
    } else if (currentScreen === "question" && currentQuestionIndex === 0) {
      navigate("/");
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setDiagnosisResult(null);
    setUserProfile(null);

    try {
      sessionStorage.removeItem("diagnosisResult");
      sessionStorage.removeItem("diagnosisAnswers");
    } catch (e) {
      console.error(e);
    }

    navigate("/");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "question":
        return (
          <QuestionScreen
            question={questionList[currentQuestionIndex]}
            currentStep={currentQuestionIndex + 1}
            totalSteps={totalSteps}
            onAnswer={handleAnswer}
            onBack={handleBack}
          />
        );

      case "loading":
        return <LoadingScreen onComplete={handleLoadingComplete} />;

      case "result":
        return (
          diagnosisResult && (
            <ResultScreen
              result={diagnosisResult}
              onDetailedDiagnosis={handleProceedToConditionDiagnosis} // ★引数ありで渡す
              onRestart={handleRestart}
              showDetailedButton={true}
              answersMap={answers}
            />
          )
        );

      case "jobs":
        return (
          diagnosisResult &&
          userProfile && (
            <JobScreen
              primaryType={diagnosisResult.primaryType}
              secondaryType={diagnosisResult.secondaryTypes?.[0]}
              profile={userProfile}
              onRestart={handleRestart}
              onBackToResult={() => setCurrentScreen("result")}
              isFromDetailedDiagnosis={true}
            />
          )
        );

      default:
        return null;
    }
  };

  return <div className="font-sans bg-[#f5f5f5]">{renderScreen()}</div>;
}
