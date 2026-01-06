// src/components/CharacterDetailScreen.tsx
import React, { useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { CHARACTER_BY_NAME } from "../data/Characters";
import { JOB_MASTER } from "../data/jobMaster";
import { JobMasterEntry } from "../types/diagnosis";
import { getImagePath } from "../utils/imagePath";

export default function CharacterDetailScreen() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // 結果画面から来たかどうか
  const fromResult =
    (location.state as { fromResult?: boolean } | null)?.fromResult === true;

  const decodedName = name ? decodeURIComponent(name) : "";
  const character = CHARACTER_BY_NAME[decodedName];

  // このキャラに紐づいた「向いている職種」
  const jobsForCharacter: JobMasterEntry[] = useMemo(() => {
    if (!decodedName) return [];
    const list = JOB_MASTER.filter((job) => {
      const score = job.characterScores?.[decodedName];
      return typeof score === "number" && score > 0;
    });

    list.sort((a, b) => {
      const sa = a.characterScores?.[decodedName] ?? 0;
      const sb = b.characterScores?.[decodedName] ?? 0;
      return sb - sa;
    });

    return list.slice(0, 8);
  }, [decodedName]);

  const handleBackList = () => {
    navigate("/characters");
  };

  const handleBackResult = () => {
    navigate("/diagnosis", { state: { restoreResult: true } });
  };

  const handleOpenJobArticle = (job: JobMasterEntry) => {
    const url = (job.stanbyplus ?? "").trim();
    if (!url) return;
    window.open(url, "_blank");
  };

  const handleOpenJobSearch = (job: JobMasterEntry) => {
    const url =
      (job.search ?? "").trim().length > 0
        ? (job.search ?? "").trim()
        : `https://jp.stanby.com/search?q=${encodeURIComponent(job.jobName)}`;
    window.open(url, "_blank");
  };

  if (!character) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4 max-w-md w-full">
          <p className="text-gray-800 text-sm">
            このキャラクターは見つかりませんでした。
          </p>
          <button
            onClick={handleBackList}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 rounded-xl text-sm"
          >
            キャラクター一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b to-white">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-10 space-y-8">
        {/* 上部のナビゲーション */}
        <div className="flex flex-wrap items-center gap-3 mb-2">
          {!fromResult && (
            <button
              onClick={handleBackList}
              className="inline-flex items-center text-sm md:text-base text-gray-700 hover:text-orange-500 transition-colors"
            >
              ← キャラクター一覧に戻る
            </button>
          )}

          {fromResult && (
            <button
              onClick={handleBackResult}
              className="inline-flex items-center text-sm md:text-base text-orange-500 hover:text-orange-600 transition-colors"
            >
              ← 診断結果に戻る
            </button>
          )}
        </div>

        {/* キャラクター情報 */}
        <section className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* 
            画像指定: 
            - SPでは 3:2
            - PC等（md以上）では高さ 425px 固定
          */}
          {character.image && (
            <div className="w-full aspect-[3/2] md:aspect-none md:h-[425px] overflow-hidden bg-gray-100">
              <img
                src={getImagePath(character.image)}
                alt={character.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="px-5 py-6 md:px-8 md:py-8 space-y-4 md:space-y-5">
            <h1
              className="
                text-lg sm:text-xl md:text-2xl
                font-bold text-gray-900
                text-left
                whitespace-nowrap
                overflow-hidden
                text-ellipsis
                break-normal
              "
            >
              {(character.name ?? "").replace(/\r?\n/g, "")}
            </h1>

            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              {character.resultDescription ?? character.shortDescription}
            </p>

            {/* 強み */}
            {character.strengthKeywords &&
              character.strengthKeywords.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-sm md:text-base font-bold text-gray-900">
                    このキャラクターの強み
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {character.strengthKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-full bg-orange-100 text-orange-500 text-xs font-bold px-3 py-1"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </section>

        {/* 向いている職種一覧 */}
        <section className="space-y-4 md:space-y-5 pb-10">
          <h2
            className="
              text-base sm:text-lg md:text-xl
              font-bold
              text-gray-900
              whitespace-nowrap
              overflow-hidden
              text-ellipsis
            "
          >
            {`${(character.name ?? "").replace(/\r?\n/g, "")} さんに特に向いているお仕事`}
          </h2>
          <p className="text-xs md:text-sm text-gray-600 mb-2">
            相性の良い職種をピックアップしています。
          </p>

          {jobsForCharacter.length === 0 && (
            <p className="text-xs md:text-sm text-gray-500">
              このキャラクターに紐づいた職種データがまだありません。
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {jobsForCharacter.map((job) => {
              const hasJobArticleUrl =
                typeof job.stanbyplus === "string" &&
                job.stanbyplus.trim().length > 0;

              return (
                <article
                  key={job.jobId}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <p className="text-[11px] md:text-xs text-orange-500 font-bold">
                      {job.category ?? job.domainL0 ?? "お仕事"}
                    </p>
                    <h3 className="text-base md:text-lg font-bold text-gray-900">
                      {job.jobName}
                    </h3>

                    {job.jobDescription && (
                      <p className="text-xs md:text-sm text-gray-700 leading-relaxed line-clamp-4">
                        {job.jobDescription}
                      </p>
                    )}

                    {job.skillsSummary && (
                      <p className="text-[11px] md:text-xs text-gray-600 mt-1">
                        <span className="font-bold">
                          活かせるスキル／経験：
                        </span>
                        {job.skillsSummary}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    {hasJobArticleUrl ? (
                      <button
                        onClick={() => handleOpenJobArticle(job)}
                        className="w-full bg-orange-100 hover:bg-orange-200 text-orange-500 font-bold py-2.5 rounded-lg text-xs md:text-sm transition-colors"
                      >
                        どんな仕事？
                      </button>
                    ) : null}

                    <button
                      onClick={() => handleOpenJobSearch(job)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-lg text-xs md:text-sm transition-colors"
                    >
                      この職種の求人を探す
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
