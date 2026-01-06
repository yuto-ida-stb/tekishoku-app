// src/components/JobScreen.tsx

import React, { useMemo, useState, useEffect } from "react";
import { UserProfile, JobMasterEntry, JobDomainCardView } from "../types/diagnosis";
import { JOB_MASTER } from "../data/jobMaster";
import { getBestJobDomainsForProfile } from "../services/jobMatching";
import { CATEGORY_REASON_TEXTS } from "../data/categoryReasonTexts";
import JobCard from "./JobCard";

interface JobScreenProps {
  primaryType: string;
  secondaryType?: string; 
  profile: UserProfile;
  onRestart: () => void;
  onBackToResult: () => void;
  isFromDetailedDiagnosis?: boolean;
  preCalculatedDomains?: JobDomainCardView[]; 
}

export default function JobScreen({
  primaryType,
  secondaryType, 
  profile,
  onRestart,
  onBackToResult, 
  preCalculatedDomains,
}: JobScreenProps) {
  // ① カテゴリ単位のおすすめ取得
  const domains: JobDomainCardView[] = useMemo(
    () => {
      if (preCalculatedDomains) return preCalculatedDomains;
      return getBestJobDomainsForProfile(profile, JOB_MASTER, primaryType, secondaryType, 2, 6);
    },
    [profile, primaryType, secondaryType, preCalculatedDomains]
  );

  // ② カテゴリごとの「選択中職種名」を管理
  const [selectedJobsByDomain, setSelectedJobsByDomain] = useState<
    Record<string, string>
  >({});

  // 初期値：各カテゴリの最初の職種を選択
  useEffect(() => {
    setSelectedJobsByDomain((prev) => {
      const next = { ...prev };
      domains.forEach((d) => {
        if (!next[d.categoryName] && d.jobs.length) {
          next[d.categoryName] = d.jobs[0];
        }
      });
      return next;
    });
  }, [domains]);

  // 指定カテゴリの選択中 Job を取得
  const getSelectedJob = (categoryName: string): JobMasterEntry | null => {
    const name = selectedJobsByDomain[categoryName];
    if (!name) return null;
    return JOB_MASTER.find((j) => j.jobName === name) ?? null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b to-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* タイトル */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            あなたの相性の良いお仕事はこちら！
          </h1>
          <p className="text-sm text-gray-600">
          </p>
        </div>

        {/* 2カラムレイアウトでカテゴリを表示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {domains.map((domain, idx) => {
             const job = getSelectedJob(domain.categoryName);

             return (
              <div key={idx} className="flex flex-col h-full">
                {/* カテゴリヘッダー＆タグ */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-6 mb-4">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                    {domain.categoryName} 
                  </h2>
                  <p className="text-xs md:text-sm text-gray-700 mb-4 leading-relaxed">
                    {CATEGORY_REASON_TEXTS[domain.categoryName] ??
                      domain.suitableSummary ??
                      "あなたの強みが活かしやすい職種のグループです。下の職種タグから気になるものを選んで、仕事内容や求人をチェックしてみてください。"}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {domain.jobs.map((name) => {
                      const isActive =
                        selectedJobsByDomain[domain.categoryName] === name;
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() =>
                            setSelectedJobsByDomain((prev) => ({
                              ...prev,
                              [domain.categoryName]: name,
                            }))
                          }
                          className={`px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 cursor-pointer shadow-sm border active:scale-95 ${
                            isActive
                              ? "bg-orange-500 border-orange-500 text-white shadow-md"
                              : "bg-white border-gray-200 text-gray-600 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-500"
                          }`}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* 職種詳細カード */}
                <div className="flex-1">
                   {job ? (
                     <JobCard job={job} customLabel="選択中の職種" />
                   ) : (
                     <div className="h-full bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center p-8 text-gray-400 text-sm">
                       職種を選択してください
                     </div>
                   )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 戻る＆再診断 */}
        <div className="max-w-md mx-auto space-y-4 pb-6">
          <button
            onClick={onBackToResult}
            className="w-full bg-white border border-orange-200 text-orange-500 font-bold py-3 px-6 rounded-xl shadow-sm hover:bg-orange-50 transition-all duration-200 text-sm md:text-base"
          >
            診断結果へ戻る
          </button>

          <button
            onClick={onRestart}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all duration-200 text-sm md:text-base"
          >
            もう一度診断する
          </button>
        </div>

      </div>
    </div>
  );
}