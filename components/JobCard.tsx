// src/components/JobCard.tsx
import React, { useMemo, useState } from "react";
import { JobMasterEntry, UserProfile, ConditionTag } from "../types/diagnosis";

interface JobCardProps {
  job: JobMasterEntry;
  userProfile?: UserProfile;
  isSelectedCard?: boolean;
  showActions?: boolean;
  customLabel?: string;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  userProfile,
  showActions = true,
}) => {
  const [activeHelp, setActiveHelp] = useState<string | null>(null);
  const [isQualOpen, setIsQualOpen] = useState<boolean>(false);

  const handleJobSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url =
      job.search && job.search.trim().length > 0
        ? job.search
        : `https://jp.stanby.com/search?q=${encodeURIComponent(job.jobName)}`;
    window.open(url, "_blank");
  };

  const handleJobArticle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url =
      job.stanbyplus && job.stanbyplus.trim().length > 0
        ? job.stanbyplus
        : job.salaryMap && job.salaryMap.trim().length > 0
        ? job.salaryMap
        : `https://jp.stanby.com/magazine/entry/${encodeURIComponent(
            job.jobName
          )}`;
    window.open(url, "_blank");
  };

  const toggleHelp = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    setActiveHelp(activeHelp === key ? null : key);
  };

  const closeHelp = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveHelp(null);
  };

  const toggleQualOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsQualOpen((v) => !v);
  };

  const formatRouteText = (raw: string) => {
    const s = (raw ?? "").trim();
    if (!s) return "-";
    if (s.startsWith("【")) {
      return s
        .replace(/\r\n/g, "\n")
        .replace(/】\n+/g, "】 ")
        .replace(/\n{3,}/g, "\n\n");
    }
    return s.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");
  };

  const qualView = useMemo(() => {
    const norm = (s: string) =>
      (s ?? "")
        .replace(/\s+/g, "")
        .replace(/（/g, "(")
        .replace(/）/g, ")")
        .trim();

    const necessityRaw = job.qualificationNecessity || "-";
    const necessity = norm(necessityRaw);

    const isNeedNo = necessity.includes("不要");

    const relatedRaw = (job.relatedQualifications ?? "").trim();
    const hasRelatedQualificationsFlag = (job.hasRelatedQualifications ?? "").trim();

    const isNoRelated =
      relatedRaw === "" ||
      relatedRaw === "-" ||
      relatedRaw === "－" ||
      relatedRaw === "—" ||
      relatedRaw.toLowerCase() === "none" ||
      hasRelatedQualificationsFlag === "なし";

    const hasRelated = !isNoRelated;

    const label = isNeedNo ? "スキルアップ資格" : "関連資格";
    const labelHelpText =
      label === "スキルアップ資格"
        ? "基本的に資格は不要ではあるが、スキルアップを目指す際に検討すると良い資格を表示"
        : "就業に有利になる資格を表示";

    const routeLabel = hasRelated ? "資格取得のルート" : "目指す場合のルート";
    const routeHelpText = hasRelated
      ? "資格を取得するための一般的な方法です。"
      : "業務に際のルートや学習手段を表示。";

    return {
      necessityRaw,
      hasRelated,
      label,
      labelHelpText,
      routeLabel,
      routeHelpText,
    };
  }, [
    job.qualificationNecessity,
    job.relatedQualifications,
    job.hasRelatedQualifications,
  ]);

  const labels = useMemo(() => {
    const userConditions = (userProfile?.conditions ?? []) as ConditionTag[];
    const jobAffinity = (job.conditionAffinity ?? []) as ConditionTag[];

    const tagMap: { [key: string]: string } = {
      REMOTE_OK: "在宅が多め",
      LOW_COMMUNICATION_OK: "もくもく作業",
      CUSTOMER_FACING: "接客あり",
      TALK_ACTIVE: "会話多め",
      SITTING_WORK: "座り作業",
      ACTIVE_WORK: "動きあり",
      FLEXIBLE_SHIFT: "シフト柔軟",
      SHORT_HOURS_OK: "短時間OK",
      LOW_STRESS: "負担少なめ",
      SKILL_BUILDING: "スキルアップ",
      HELPING_PEOPLE: "人の役に立つ",
      ON_SITE: "現場必須",
    };

    let out = jobAffinity
      .filter((tag) => tagMap[tag])
      .map((tag) => ({ tag, label: tagMap[tag] }));

    out = out.filter((item) => {
      if (
        userConditions.includes("LOW_COMMUNICATION_OK" as ConditionTag) &&
        (item.tag === "CUSTOMER_FACING" || item.tag === "TALK_ACTIVE")
      ) {
        return false;
      }
      if (
        userConditions.includes("SITTING_WORK" as ConditionTag) &&
        item.tag === "ACTIVE_WORK"
      ) {
        return false;
      }
      if (
        userConditions.includes("REMOTE_OK" as ConditionTag) &&
        item.tag === "ON_SITE"
      ) {
        return false;
      }
      return true;
    });

    out.sort((a, b) => {
      const aMatch = userConditions.includes(a.tag) ? 1 : 0;
      const bMatch = userConditions.includes(b.tag) ? 1 : 0;
      return bMatch - aMatch;
    });

    return out.map((item) => item.label).slice(0, 4);
  }, [userProfile?.conditions, job.conditionAffinity]);

  /**
   * 変更点（指示範囲のみ）:
   * - スマホ（md未満）：縦積み（項目名の下に内容）
   * - デバイス（md以上）：横並び（左ラベル固定幅で左右カード揃え）
   */
  const ROW_GRID = "grid grid-cols-1 md:grid-cols-[168px_1fr] gap-3 items-start";

  // 高さ揃えは md以上のみ適用（スマホで無駄な空白が出ないように）
  const MIN_H_DESC = "md:min-h-[7.5rem]";
  const MIN_H_TYPE = "md:min-h-[3rem]";
  const MIN_H_SKILL = "md:min-h-[4.5rem]";
  const MIN_H_PERSON = "md:min-h-[4.5rem]";
  const MIN_H_TRAIT = "md:min-h-[4.5rem]";
  const MIN_H_STEP = "md:min-h-[4.5rem]";

  // ★追加（指示範囲）：デバイス表示で左右カードの高さ差を生む「ヘッダー（職種名＋タグ）」を固定化
  // タグが2行になる/ならない差を吸収し、以降の項目開始位置を左右で揃える
  const MIN_H_HEADER = "md:min-h-[7.25rem]";

  return (
    <article className="h-full flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* 職種名 */}
      <div className={`p-6 pb-4 ${MIN_H_HEADER}`}>
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug">
          {job.jobName}
        </h3>

        {labels.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {labels.map((t) => (
              <span
                key={t}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-orange-500 border border-orange-200"
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="px-6 pb-8 flex-1 flex flex-col">
        <div className="space-y-4">
          {/* 具体的な仕事内容 */}
          <div className={ROW_GRID}>
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 bg-gray-300 rounded-full" />
              <span className="font-bold text-gray-800 text-sm">
                具体的な仕事内容
              </span>
            </div>
            <p
              className={`text-sm md:text-base text-gray-600 leading-relaxed whitespace-pre-line ${MIN_H_DESC}`}
            >
              {job.jobDescription || "-"}
            </p>
          </div>

          {/* 主な雇用形態 */}
          <div className={ROW_GRID}>
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 bg-orange-500 rounded-full" />
              <span className="font-bold text-gray-800 text-sm">
                主な雇用形態
              </span>
            </div>
            <p
              className={`text-sm text-gray-700 leading-relaxed whitespace-pre-line ${MIN_H_TYPE}`}
            >
              {job.employmentType || "-"}
            </p>
          </div>

          {/* 活かせるスキル/経験 */}
          <div className={ROW_GRID}>
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 bg-orange-500 rounded-full" />
              <span className="font-bold text-gray-800 text-sm">
                活かせるスキル／経験
              </span>
            </div>
            <p
              className={`text-sm text-gray-700 leading-relaxed whitespace-pre-line ${MIN_H_SKILL}`}
            >
              {job.skillsSummary || "-"}
            </p>
          </div>

          {/* 向いている人物タイプ */}
          <div className={ROW_GRID}>
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 bg-green-400 rounded-full" />
              <span className="font-bold text-gray-800 text-sm">
                向いている人物タイプ
              </span>
            </div>
            <p
              className={`text-sm text-gray-700 leading-relaxed whitespace-pre-line ${MIN_H_PERSON}`}
            >
              {job.suitablePersonType || "-"}
            </p>
          </div>

          {/* 求められる資質 */}
          <div className={ROW_GRID}>
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 bg-red-400 rounded-full" />
              <span className="font-bold text-gray-800 text-sm">
                求められる資質
              </span>
            </div>
            <p
              className={`text-sm text-gray-700 leading-relaxed whitespace-pre-line ${MIN_H_TRAIT}`}
            >
              {job.requiredTraits || "-"}
            </p>
          </div>

          {/* 最初のステップ */}
          <div className={ROW_GRID}>
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-400 rounded-full" />
              <span className="font-bold text-gray-800 text-sm">
                最初のステップ
              </span>
            </div>
            <p
              className={`text-sm text-gray-700 leading-relaxed whitespace-pre-line ${MIN_H_STEP}`}
            >
              {job.whatToStartWith || "-"}
            </p>
          </div>
        </div>

        {/* 資格ブロック */}
        <div className="mt-6 bg-orange-50/60 rounded-xl border border-orange-100 mb-6 relative">
          <div className="px-5 py-4 border-b border-orange-200/50">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800 text-sm">
                    資格の必要性
                  </span>

                  <button
                    type="button"
                    onClick={(e) => toggleHelp(e, "necessity")}
                    className="w-4 h-4 rounded-full bg-gray-300 hover:bg-gray-400 text-white text-[10px] font-bold flex items-center justify-center transition-colors focus:outline-none"
                    aria-label="ヘルプ"
                  >
                    ?
                  </button>

                  {activeHelp === "necessity" && (
                    <div className="relative">
                      <div className="absolute left-0 bottom-full mb-2 w-64 bg-white border border-gray-200 shadow-xl rounded-lg p-3 z-20 text-xs text-left leading-relaxed">
                        <div className="flex justify-between items-start border-b border-gray-100 pb-1 mb-1.5">
                          <span className="font-bold text-gray-800">
                            資格の必要性の意味
                          </span>
                          <button
                            onClick={closeHelp}
                            className="text-gray-400 hover:text-gray-600 text-lg leading-none -mt-1"
                          >
                            ×
                          </button>
                        </div>
                        <ul className="space-y-1.5 text-gray-600">
                          <li className="flex gap-1.5">
                            <span className="font-bold text-orange-500 whitespace-nowrap">
                              必須
                            </span>
                            <span>＝資格取得が条件</span>
                          </li>
                          <li className="flex gap-1.5">
                            <span className="font-bold text-blue-500 whitespace-nowrap">
                              推奨
                            </span>
                            <span>＝なくても可だがあると有利</span>
                          </li>
                          <li className="flex gap-1.5">
                            <span className="font-bold text-green-500 whitespace-nowrap">
                              不要
                            </span>
                            <span>＝資格なしで就業可</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-1 text-gray-900 font-black text-base">
                  {job.qualificationNecessity || "-"}
                </div>
              </div>

              <button
                type="button"
                onClick={toggleQualOpen}
                className={[
                  "shrink-0 inline-flex items-center justify-center px-3 py-2 rounded-lg border text-xs font-black transition-all",
                  isQualOpen
                    ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                    : "bg-white text-orange-500 border-orange-200 hover:bg-orange-50",
                ].join(" ")}
                aria-expanded={isQualOpen}
              >
                CHECK
              </button>
            </div>
          </div>

          {isQualOpen ? (
            <div className="px-5 py-4 space-y-3 text-sm rounded-b-xl">
              {qualView.hasRelated ? (
                <>
                  <div className={ROW_GRID}>
                    <div className="flex items-center gap-2 relative">
                      <span className="font-bold text-gray-700 text-sm">
                        {qualView.label}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => toggleHelp(e, "skillup")}
                        className="w-4 h-4 rounded-full bg-gray-300 hover:bg-gray-400 text-white text-[10px] font-bold flex items-center justify-center transition-colors focus:outline-none"
                        aria-label="ヘルプ"
                      >
                        ?
                      </button>

                      {activeHelp === "skillup" ? (
                        <div className="absolute left-0 bottom-full mb-2 w-72 bg-white border border-gray-200 shadow-xl rounded-lg p-3 z-20 text-xs text-left leading-relaxed">
                          <div className="flex justify-between items-start border-b border-gray-100 pb-1 mb-1.5">
                            <span className="font-bold text-gray-800">
                              {qualView.label}とは
                            </span>
                            <button
                              onClick={closeHelp}
                              className="text-gray-400 hover:text-gray-600 text-lg leading-none -mt-1"
                            >
                              ×
                            </button>
                          </div>
                          <p className="text-gray-600">{qualView.labelHelpText}</p>
                        </div>
                      ) : null}
                    </div>

                    <span className="text-gray-900 font-semibold whitespace-pre-line">
                      {job.relatedQualifications || "-"}
                    </span>
                  </div>

                  <div className={ROW_GRID}>
                    <span className="font-bold text-gray-700 text-sm">
                      資格取得難易度
                    </span>
                    <span className="text-gray-900 font-semibold whitespace-pre-line">
                      {job.qualificationDifficulty || "-"}
                    </span>
                  </div>

                  <div className={ROW_GRID}>
                    <div className="flex items-center gap-2 relative">
                      <span className="font-bold text-gray-700 text-sm">
                        {qualView.routeLabel}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => toggleHelp(e, "route")}
                        className="w-4 h-4 rounded-full bg-gray-300 hover:bg-gray-400 text-white text-[10px] font-bold flex items-center justify-center transition-colors focus:outline-none"
                        aria-label="ヘルプ"
                      >
                        ?
                      </button>

                      {activeHelp === "route" ? (
                        <div className="absolute left-0 bottom-full mb-2 w-72 bg-white border border-gray-200 shadow-xl rounded-lg p-3 z-20 text-xs text-left leading-relaxed">
                          <div className="flex justify-between items-start border-b border-gray-100 pb-1 mb-1.5">
                            <span className="font-bold text-gray-800">
                              {qualView.routeLabel}とは
                            </span>
                            <button
                              onClick={closeHelp}
                              className="text-gray-400 hover:text-gray-600 text-lg leading-none -mt-1"
                            >
                              ×
                            </button>
                          </div>
                          <p className="text-gray-600">{qualView.routeHelpText}</p>
                        </div>
                      ) : null}
                    </div>

                    <span className="text-gray-900 font-semibold whitespace-pre-line leading-relaxed">
                      {formatRouteText(job.qualificationAcquisitionPath)}
                    </span>
                  </div>
                </>
              ) : (
                <div className={ROW_GRID}>
                  <div className="flex items-center gap-2 relative">
                    <span className="font-bold text-gray-700 text-sm">
                      目指す場合のルート
                    </span>
                    <button
                      type="button"
                      onClick={(e) => toggleHelp(e, "route")}
                      className="w-4 h-4 rounded-full bg-gray-300 hover:bg-gray-400 text-white text-[10px] font-bold flex items-center justify-center transition-colors focus:outline-none"
                      aria-label="ヘルプ"
                    >
                      ?
                    </button>

                    {activeHelp === "route" ? (
                      <div className="absolute left-0 bottom-full mb-2 w-72 bg-white border border-gray-200 shadow-xl rounded-lg p-3 z-20 text-xs text-left leading-relaxed">
                        <div className="flex justify-between items-start border-b border-gray-100 pb-1 mb-1.5">
                          <span className="font-bold text-gray-800">
                            目指す場合のルートとは
                          </span>
                          <button
                            onClick={closeHelp}
                            className="text-gray-400 hover:text-gray-600 text-lg leading-none -mt-1"
                          >
                            ×
                          </button>
                        </div>
                        <p className="text-gray-600">業務に際のルートや学習手段を表示。</p>
                      </div>
                    ) : null}
                  </div>

                  <span className="text-gray-900 font-semibold whitespace-pre-line leading-relaxed">
                    {formatRouteText(job.qualificationAcquisitionPath)}
                  </span>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* アクションボタン */}
        {showActions ? (
          <div className="flex flex-col gap-3 pt-6">
            <button
              onClick={handleJobArticle}
              className="w-full bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-bold py-3.5 px-4 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 group"
            >
               🔗 記事を見る
            </button>

            <button
              onClick={handleJobSearch}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4 text-orange-100"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              この職種の求人を探す
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
};

export default JobCard;
