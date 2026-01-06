// src/components/ConditionQuestionScreen.tsx
import React from "react";
import { ConditionQuestion } from "../types/diagnosis";

type Props = {
  question: ConditionQuestion;
  currentStep: number;
  totalSteps: number;
  onAnswer: (optionId: string) => void;
  onBack: () => void;
};

export default function ConditionQuestionScreen({
  question,
  currentStep,
  totalSteps,
  onAnswer,
  onBack,
}: Props) {
  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4 py-10 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-[2rem] border border-orange-200 shadow-xl px-6 sm:px-10 py-10">
        {/* Header */}
        <div className="text-center">
          <div className="text-orange-500 font-bold tracking-wide">
            働き方診断
          </div>

          {/* font-extrabold -> font-bold */}
          <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-900">
            {question.question}
          </h1>
        </div>

        {/* Options */}
        <div className="mt-10 space-y-5">
          {question.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onAnswer(opt.id)}
              className={[
                "w-full",
                "bg-orange-50/50 hover:bg-orange-50",
                "border border-orange-100",
                "rounded-2xl",
                "px-5 sm:px-7 py-6",
                "text-left",
                "shadow-sm hover:shadow-md",
                "transition-all active:scale-[0.99]",
                "flex items-center gap-4",
              ].join(" ")}
            >
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-200 text-orange-500 font-black flex-shrink-0">
                {opt.id}
              </span>

              <span className="text-gray-800 font-bold text-base sm:text-lg leading-snug">
                {opt.text}
              </span>
            </button>
          ))}

          <div className=" text-center text-gray-500 text-sm mt-2">
            質問 {currentStep} / {totalSteps}
          </div>

        </div>

        {/* Back */}
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 underline decoration-gray-300 underline-offset-4 text-sm transition-colors"
          >
            前の質問に戻る
          </button>
        </div>
      </div>
    </div>
  );
}