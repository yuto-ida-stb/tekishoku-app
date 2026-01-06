// src/components/QuestionScreen.tsx
import React from "react";
import { Question } from "../types";

interface QuestionScreenProps {
  question: Question;
  currentStep: number;
  totalSteps: number;
  onAnswer: (optionId: string) => void;
  onBack: () => void;
  isSecondStage?: boolean;
}

export default function QuestionScreen({
  question,
  currentStep,
  totalSteps,
  onAnswer,
  onBack,
  isSecondStage = false,
}: QuestionScreenProps) {
  const progress = Math.max(
    0,
    Math.min(100, Math.round((currentStep / totalSteps) * 100))
  );

  return (
    <div className="min-h-screen bg-gradient-to-b to-white flex flex-col">
      <main className="flex-1 flex justify-center items-start md:items-center px-4 py-8">
        <div className="w-full max-w-3xl bg-white/90 rounded-3xl shadow-xl p-6 md:p-8 space-y-6">
          {/* 質問ヘッダー */}
          <div className="text-center space-y-2">
            <p className="text-sm md:text-base font-semibold text-orange-500">
              Q{question.id} / {totalSteps}
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed">
              {question.text}
            </h2>
          </div>

          {/* 選択肢 */}
          <div className="space-y-5">
            {question.options.map((option) => (
              <button
                key={option.value}
                onClick={() => onAnswer(option.value)}
                className="w-full bg-white hover:bg-orange-50 border border-orange-100 hover:border-orange-300
                           rounded-2xl px-4 py-4 md:px-5 md:py-5
                           transition-all duration-200 shadow-sm hover:shadow-md text-left"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="bg-orange-100 text-orange-600 font-bold text-lg md:text-xl
                               w-9 h-9 md:w-10 md:h-10 flex items-center justify-center
                               rounded-full flex-shrink-0"
                  >
                    {option.value}
                  </span>
                  <span className="text-gray-700 text-base md:text-lg font-bold leading-relaxed">
                    {option.label}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* 戻る＋進捗バー */}
          <div className="pt-4 border-t border-orange-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <button
              onClick={onBack}
              className="px-3 py-1 bg-orange-50 text-gray-600 hover:text-orange-600 rounded-full
                         text-sm font-semibold mx-auto sm:mx-0"
            >
              ← 戻る
            </button>

            <div className="flex-1">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>
                  質問 {currentStep} / {totalSteps}
                </span>
                <span aria-live="polite">{progress}%</span>
              </div>
              <div className="h-2 bg-orange-50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                  aria-label="進捗状況"
                />
              </div>
            </div>
          </div>

          {isSecondStage && (
            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                詳細診断で、より具体的な職種をご提案します
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
