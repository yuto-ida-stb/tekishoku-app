// src/components/ResultScreen.tsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DiagnosisResult, FIVE_KEYS } from "../types";
import { CHARACTER_BY_NAME } from "../data/Characters";
import {
  shareToTwitter,
  calculateFiveFactorsFromAnswers,
} from "../utils/diagnosisLogic";
import { getMatchedJobs } from "../services/jobMatching";
import { JOB_MASTER } from "../data/jobMaster";
import { FiExternalLink } from "react-icons/fi";
import { getImagePath } from "../utils/imagePath";

interface ResultScreenProps {
  result: DiagnosisResult;
  onDetailedDiagnosis: (firstStageCategoryKeys: string[]) => void;
  onRestart: () => void;
  answersMap?: { [key: number]: string };
  showDetailedButton?: boolean;
}

const StanbyMark: React.FC<{ active: boolean }> = ({ active }) => (
  <svg
    viewBox="0 0 100 100"
    className={`w-5 h-5 ${active ? "fill-orange-500" : "fill-gray-200"}`}
  >
    <path d="M50,10 C27.9,10 10,27.9 10,50 C10,72.1 27.9,90 50,90 C72.1,90 90,72.1 90,50 C90,37.6 84.3,26.5 75.3,19.3 L69.5,25.1 C75.9,30.8 80,39.1 80,48.3 C80,65.8 65.8,80 48.3,80 C30.8,80 16.7,65.8 16.7,48.3 C16.7,30.8 30.8,16.7 48.3,16.7 C55.3,16.7 61.8,19 67.1,22.9 L72.9,17.1 C66.3,12.6 58.5,10 50,10 Z M65,35 L45,55 L35,45 L28,52 L45,69 L72,42 L65,35 Z" />
  </svg>
);

export default function ResultScreen({
  result,
  onDetailedDiagnosis,
  onRestart,
  answersMap,
}: ResultScreenProps) {
  const navigate = useNavigate();

  const primaryTypeKey = (result?.primaryType ?? "") as string;
  const primaryTypeData = primaryTypeKey
    ? CHARACTER_BY_NAME[primaryTypeKey]
    : undefined;

  const secondaryList =
    result?.secondaryTypes
      ?.slice(0, 1)
      .map((name) => CHARACTER_BY_NAME[name])
      .filter(Boolean) ?? [];

  const suitablePersonItems = useMemo(() => {
    const items: string[] = [];
    if (primaryTypeData?.suitablePersonTypeVer1)
      items.push(primaryTypeData.suitablePersonTypeVer1);
    if (primaryTypeData?.suitablePersonTypeVer2)
      items.push(primaryTypeData.suitablePersonTypeVer2);
    if (primaryTypeData?.suitablePersonTypeVer3)
      items.push(primaryTypeData.suitablePersonTypeVer3);
    return items;
  }, [primaryTypeData]);

  const [jobCategories, setJobCategories] = useState<string[]>([]);

  useEffect(() => {
    const matched = getMatchedJobs(JOB_MASTER, result);
    const uniqueCategories = new Set<string>();

    matched.slice(0, 30).forEach((card) => {
      const originalJob = JOB_MASTER.find((j) => j.jobName === card.jobName);
      if (originalJob) {
        const cat = originalJob.domainL0 || originalJob.category;
        if (cat) uniqueCategories.add(cat);
      }
    });

    setJobCategories(Array.from(uniqueCategories).slice(0, 4));
  }, [result]);

  const fiveFactorView = useMemo(() => {
    const baseScores: Record<string, number> = {};

    if (answersMap) {
      const { fiveScores } = calculateFiveFactorsFromAnswers(answersMap);
      FIVE_KEYS.forEach((key) => {
        baseScores[key] = fiveScores[key] ?? 0;
      });
    } else {
      FIVE_KEYS.forEach((key) => {
        baseScores[key] = result?.factorScores?.[key] ?? 0;
      });
    }

    return FIVE_KEYS.map((key) => {
      const raw = baseScores[key] ?? 0;
      let icons = raw;
      if (raw === 3) icons = 5;
      else if (raw === 2) icons = 3;
      else if (raw === 1) icons = 1;
      else icons = Math.min(5, Math.max(1, Math.round(raw)));

      return {
        label: key,
        raw,
        icons,
      };
    });
  }, [answersMap, result?.factorScores]);

  const handleShare = () => {
    if (primaryTypeKey) shareToTwitter(String(primaryTypeKey));
  };

  const handleClickCharacterDetail = (name: string) => {
    if (!name) return;
    navigate(`/characters/${encodeURIComponent(name)}`, {
      state: { fromResult: true },
    });
  };

  const handleProceedToDetailed = useCallback(() => {
    onDetailedDiagnosis(jobCategories);
  }, [onDetailedDiagnosis, jobCategories]);

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-8 px-4 font-sans text-gray-800">
      <div className="max-w-3xl mx-auto bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
        {/* Header - Use brand color #EF671F */}
        <header className="bg-orange-500 py-5 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold tracking-wider">
              診断結果
            </h1>
            <p className="text-sm mt-1 opacity-90 font-medium">
              あなたの才能は
            </p>
          </div>
        </header>

        <div className="p-6 md:p-10 space-y-10">
          {/* Main Character Section */}
          <section className="text-center md:text-left">
            {/* Image */}
            {primaryTypeData?.image && (
              <div className="w-full mb-8 rounded-2xl overflow-hidden shadow-sm bg-gray-100">
                <img
                  src={getImagePath(primaryTypeData.image)}
                  alt={primaryTypeData.name}
                  className="w-full h-auto max-h-[350px] object-cover mx-auto"
                />
              </div>
            )}

            {/* Title & Desc */}
            <div className="mb-6">
              <h2
                className="
                  text-xl sm:text-2xl md:text-3xl
                  font-bold
                  mb-4
                  text-gray-900
                  text-center
                  whitespace-nowrap
                  overflow-hidden
                  text-ellipsis
                "
              >
                {(primaryTypeData?.name ?? "").replace(/\r?\n/g, "")}
              </h2>

              <p className="text-gray-700 leading-relaxed text-sm md:text-base text-justify md:text-left">
                {primaryTypeData?.resultDescription}
              </p>
            </div>

            {/* Strength Keywords */}
            <div className="flex flex-wrap gap-2 mb-8">
              {primaryTypeData?.strengthKeywords?.map((kw, i) => (
                <span
                  key={i}
                  className="bg-orange-100 text-orange-500 px-4 py-1.5 rounded-full text-xs font-bold"
                >
                  {kw}
                </span>
              ))}
            </div>

            {/* Job Categories */}
            <div className="mb-8 pt-4 border-t border-gray-100">
              <h3 className="text-left font-bold text-base md:text-lg mb-4 text-gray-800">
                あなたに向いているお仕事の傾向
              </h3>
              <div className="flex flex-wrap gap-3 mb-2">
                {jobCategories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      navigate(`/categories/${encodeURIComponent(cat)}`, {
                        state: { primaryType: primaryTypeKey },
                      })
                    }
                    className="border border-orange-200 bg-white text-gray-700 px-4 py-2 rounded-lg text-xs md:text-sm font-bold flex items-center shadow-sm hover:shadow-md hover:bg-orange-50 transition-all"
                  >
                    {cat}
                    <FiExternalLink className="ml-2 text-gray-400 w-4 h-4" />
                  </button>
                ))}
              </div>
              <p className="text-[13px] text-gray-500 mb-6 text-left flex items-center gap-1">
                <FiExternalLink className="w-3.5 h-3.5" />
                詳しくは職種をクリック！
              </p>

              {/* Suitable Person Box */}
              {suitablePersonItems.length > 0 && (
                <div className="text-left bg-orange-50 rounded-xl p-5 md:p-6 border border-orange-100">
                  <h4 className="font-bold text-orange-500 text-xs mb-3">
                    こんな人に向いています：
                  </h4>
                  <ul className="space-y-2">
                    {suitablePersonItems.map((item, i) => (
                      <li
                        key={i}
                        className="text-left flex items-start text-xs md:text-sm text-gray-700 leading-snug"
                      >
                        <span className="mr-2 text-orange-500 mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          {/* Action Buttons */}
          <section className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleProceedToDetailed}
              className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] text-white py-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-center group active:transform active:scale-95"
            >
              <div className="text-lg">よりマッチしたお仕事を見る</div>
              <div className="text-xs opacity-90 font-normal mt-0.5">
                ※残り5問
              </div>
            </button>

            <button
              onClick={handleShare}
              className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white py-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:transform active:scale-95"
            >
              <div className="text-lg">結果をシェアする</div>
              <div className="text-xs opacity-90 font-normal mt-0.5">
                X (Twitter)
              </div>
            </button>
          </section>

          {/* Secondary Types */}
          <section>
            <h3 className="font-bold text-lg mb-2 text-gray-800">
              あなたのその他の側面
            </h3>
            <p className="text-xs md:text-sm text-gray-500 mb-6">
              {primaryTypeData?.name} の特性が最も強く出ていますが、以下のタイプの特徴もあわせ持っています。
            </p>
            <div className="space-y-4">
              {secondaryList.map((type, idx) => (
                <div
                  key={idx}
                  onClick={() => handleClickCharacterDetail(type.name)}
                  className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex gap-4 cursor-pointer hover:border-orange-200 transition-colors group"
                >
                  <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-200">
                    <img
                      src={getImagePath(type.image)}
                      alt={type.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-800 text-sm">
                        {type.name}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {type.shortDescription}
                    </p>
                    <p className="text-[10px] md:text-xs text-orange-500 font-bold underline decoration-orange-200 underline-offset-2 mt-2">
                      このタイプの詳しい説明と向いている職種を見る →
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Strength Radar */}
          <section>
            <h3 className="font-bold text-lg mb-6 text-gray-800">
              あなたの強みはここ！
            </h3>
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5 shadow-sm">
              {fiveFactorView.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-dashed border-gray-100 pb-2 last:border-0 last:pb-0"
                >
                  <span className="text-sm font-bold text-gray-600">
                    {item.label}
                  </span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <StanbyMark key={i} active={i < item.icons} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Restart */}
          <button
            onClick={onRestart}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 rounded-xl transition-colors shadow-sm"
          >
            もう一度診断する
          </button>
        </div>
      </div>
    </div>
  );
}
