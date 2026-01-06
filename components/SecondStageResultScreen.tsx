// src/components/SecondStageResultScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import JobCard from "./JobCard";
import { JobCardView, UserProfile } from "../types/diagnosis";
import { CATEGORY_REASON_TEXTS } from "../data/categoryReasonTexts";

const JOBS_PER_CATEGORY = 6;
const MAX_CATEGORIES = 2;

type CategoryBlock = {
  categoryName: string;
  reason?: string;
  jobs: JobCardView[];
};

/**
 * カテゴリキーの生成（domainL0優先→category→その他）
 * trimで空白差分事故を防止
 */
function getCategoryKey(j: JobCardView) {
  return (j.domainL0 || j.category || "その他").trim();
}

export default function SecondStageResultScreen({
  onRestart,
}: {
  onRestart: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [rankedJobs, setRankedJobs] = useState<JobCardView[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [firstStageCategoryKeys, setFirstStageCategoryKeys] = useState<string[]>(
    []
  );

  // カテゴリごとの「選択中jobId」を保持
  const [selectedByCategory, setSelectedByCategory] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    const state = location.state as
      | {
          rankedJobs?: JobCardView[];
          userProfile?: UserProfile;
          firstStageCategoryKeys?: string[];
        }
      | null;

    if (state?.rankedJobs && state?.userProfile) {
      setRankedJobs(state.rankedJobs);
      setUserProfile(state.userProfile);
      setFirstStageCategoryKeys(state.firstStageCategoryKeys ?? []);
    } else {
      navigate("/", { replace: true });
    }
  }, [location.state, navigate]);

  /**
   * 第2段階の母集団を「第1段階カテゴリ」に制限。
   */
  const rankedJobsFiltered = useMemo(() => {
    if (!firstStageCategoryKeys || firstStageCategoryKeys.length === 0) {
      return rankedJobs;
    }

    const allowed = new Set(
      firstStageCategoryKeys.map((s) => (s ?? "").trim())
    );

    const filtered = rankedJobs.filter((j) => allowed.has(getCategoryKey(j)));
    return filtered.length > 0 ? filtered : rankedJobs;
  }, [rankedJobs, firstStageCategoryKeys]);

  // カテゴリで2枠を作る
  const categoryBlocks: CategoryBlock[] = useMemo(() => {
    const byCat: Record<string, JobCardView[]> = {};

    rankedJobsFiltered.forEach((j) => {
      const cat = getCategoryKey(j);
      if (!byCat[cat]) byCat[cat] = [];
      byCat[cat].push(j);
    });

    return Object.entries(byCat)
      .map(([categoryName, jobs]) => {
        const topScore = Math.max(
          ...jobs.map((x) => x.totalScore ?? x.totalMatchScore ?? 0)
        );
        return { categoryName, jobs, topScore };
      })
      .sort((a, b) => b.topScore - a.topScore)
      .slice(0, MAX_CATEGORIES)
      .map((c) => ({
        categoryName: c.categoryName,
        reason: CATEGORY_REASON_TEXTS[c.categoryName],
        jobs: c.jobs
          .slice()
          .sort(
            (a, b) =>
              (b.totalScore ?? b.totalMatchScore ?? 0) -
              (a.totalScore ?? a.totalMatchScore ?? 0)
          )
          .slice(0, JOBS_PER_CATEGORY),
      }));
  }, [rankedJobsFiltered]);

  // 初期選択（カテゴリごとに先頭を選択）
  useEffect(() => {
    if (!categoryBlocks.length) return;

    setSelectedByCategory((prev) => {
      const next = { ...prev };

      categoryBlocks.forEach((block) => {
        const cat = block.categoryName;
        if (!next[cat]) {
          const first = block.jobs[0];
          if (first?.jobId) next[cat] = first.jobId;
        }
      });

      return next;
    });
  }, [categoryBlocks]);

  const handleSelectJob = (categoryName: string, jobId: string) => {
    setSelectedByCategory((prev) => ({
      ...prev,
      [categoryName]: jobId,
    }));
  };

  // 「カテゴリ → 選択中Job」を引けるようにしておく
  const selectedJobByCategory = useMemo(() => {
    const map: Record<string, JobCardView | null> = {};
    categoryBlocks.forEach((block) => {
      const jobId = selectedByCategory[block.categoryName];
      map[block.categoryName] =
        block.jobs.find((j) => j.jobId === jobId) ?? block.jobs[0] ?? null;
    });
    return map;
  }, [categoryBlocks, selectedByCategory]);

  const renderCategoryPanel = (block: CategoryBlock) => (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 h-full">
      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">
        {block.categoryName}
      </h3>

      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        {block.reason
          ? block.reason
          : "あなたの適性と希望条件から、相性が良い可能性が高いカテゴリです。"}
      </p>

      <div className="flex flex-wrap gap-2">
        {block.jobs.map((j) => {
          const isSelected = selectedByCategory[block.categoryName] === j.jobId;

          return (
            <button
              key={j.jobId}
              type="button"
              onClick={() => handleSelectJob(block.categoryName, j.jobId)}
              className={[
                "inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-bold transition-all",
                "shadow-sm hover:shadow-md active:scale-[0.99]",
                isSelected
                  ? "bg-orange-500 border-orange-500 text-white"
                  : "bg-white border-orange-200 text-orange-500 hover:bg-orange-50",
              ].join(" ")}
              aria-pressed={isSelected}
            >
              <span className="whitespace-nowrap">{j.jobName}</span>
              {isSelected ? (
                <span className="text-white text-xs leading-none">▼</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderDetailPanel = (block: CategoryBlock) => {
    const selectedJob = selectedJobByCategory[block.categoryName];

    return (
      <div className="h-full">
        <div className="mb-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border border-orange-200 bg-orange-50 text-orange-500">
            選択中の職種
          </span>
        </div>

        {selectedJob && userProfile ? (
          <JobCard
            job={selectedJob}
            isSelectedCard
            showActions
            userProfile={userProfile}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-gray-500 h-full">
            表示できる職種がありませんでした。
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-6xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-orange-100">
        <header className="bg-orange-500 text-white text-center py-8 px-4 relative overflow-hidden">
          <div className="relative z-10">
            <h1
              className="
                text-xl sm:text-2xl md:text-4xl
                font-bold tracking-tight drop-shadow-sm
                whitespace-nowrap text-center
              "
            >
              あなたの相性の良いお仕事はこちら！
            </h1>
          </div>
        </header>

        <div className="p-6 md:p-10 space-y-10">
          <section className="space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-red-500 rounded-full"></span>
              向いている職種カテゴリ
            </h2>

            <div className="grid grid-cols-1 gap-y-14 md:hidden">
              {categoryBlocks.map((block) => (
                <div key={block.categoryName} className="flex flex-col gap-4">
                  {renderCategoryPanel(block)}
                  {renderDetailPanel(block)}
                </div>
              ))}
            </div>

            <div className="hidden md:block">
              <div className="grid grid-cols-2 gap-6 items-stretch">
                {categoryBlocks.map((block) => (
                  <div key={block.categoryName} className="h-full">
                    {renderCategoryPanel(block)}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-6 items-stretch mt-6">
                {categoryBlocks.map((block) => (
                  <div key={block.categoryName} className="h-full">
                    {renderDetailPanel(block)}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-4 items-center pt-6">
            <button
              onClick={() =>
                navigate("/diagnosis", {
                  state: { restoreResult: true },
                  replace: true,
                })
              }
              className="text-gray-600 hover:text-gray-800 text-sm underline decoration-gray-300 underline-offset-4 transition-colors"
            >
              診断結果へ戻る
            </button>

            <button
              onClick={onRestart}
              className="text-gray-400 hover:text-gray-600 text-sm underline decoration-gray-300 underline-offset-4 transition-colors"
            >
              もう一度診断する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}