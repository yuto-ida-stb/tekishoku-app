// src/components/CategoryJobsScreen.tsx
import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { JOB_MASTER } from "../data/jobMaster";
import JobCard from "./JobCard";
import { JobMasterEntry } from "../types/diagnosis";
import { useLocation } from "react-router-dom";

export default function CategoryJobsScreen() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const decodedCategoryName = decodeURIComponent(categoryName || "");

  // state から primaryType を取得
  const primaryType = (location.state as any)?.primaryType as string | undefined;

  // カテゴリに属する職種を抽出
  const categoryJobs = useMemo(() => {
    if (!decodedCategoryName) return [];
    
    // まずカテゴリで絞り込み
    let jobs = JOB_MASTER.filter(
      (job) => (job.domainL0 || job.category) === decodedCategoryName
    );

    // キャラクター指定がある場合は、適性スコア > 0 でさらに絞り込み＆スコア順にソート
    if (primaryType) {
      jobs = jobs.filter((job) => (job.characterScores?.[primaryType] ?? 0) > 0);
      jobs.sort((a, b) => {
        const scoreA = a.characterScores?.[primaryType] ?? 0;
        const scoreB = b.characterScores?.[primaryType] ?? 0;
        return scoreB - scoreA; // 降順
      });
    }

    return jobs;
  }, [decodedCategoryName, primaryType]);

  const handleBackToResult = () => {
    // 診断結果画面（キャラクター表示）に戻るために、restoreResultフラグを渡して遷移
    navigate("/diagnosis", { state: { restoreResult: true } });
  };

  if (!categoryJobs.length) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            職種が見つかりませんでした
          </h2>
          <p className="text-gray-600 mb-6">
            カテゴリ名: {decodedCategoryName}
            {primaryType && <br />}
            {primaryType && `（${primaryType}向けの職種）`}
          </p>
          <button
            onClick={handleBackToResult}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {decodedCategoryName}の職種一覧
            </h1>
            <button
            onClick={handleBackToResult}
            className="text-orange-600 hover:text-orange-800 font-medium px-4 py-2 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
            >
            戻る
            </button>
        </div>
        
        {/* レスポンシブ対応：モバイル1カラム、PC2カラム */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {categoryJobs.map((job) => (
             <JobCard key={job.jobId} job={job} />
          ))}
        </div>
      </div>
    </div>
  );
}
