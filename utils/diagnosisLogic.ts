// src/utils/diagnosisLogic.ts

import { DiagnosisResult, FIVE_KEYS, FiveScores, Question } from "../types";
import { CHARACTERS } from "../data/Characters";
import { QUESTIONS as defaultQuestions } from "../data/questions";
import { CHARACTER_STRENGTH_SCORES } from "../data/strengthScores";

/**
 * 回答（=rawScores）に応じて5因子を動的に生成する。
 * - 各キャラの固定5因子スコア（CHARACTER_STRENGTH_SCORES）を
 *   回答から算出したキャラスコア（rawScores）で加重平均する。
 * - 最終的には 0〜3 の整数に丸めて返す（既存UIの期待レンジを維持）。
 */
function buildDynamicFiveScoresFromRawScores(
  rawScores: Record<string, number>
): FiveScores {
  const out: FiveScores = {
    "コツコツ実行力": 0,
    "チームサポート力": 0,
    "共感コミュ力": 0,
    "アイデア創造力": 0,
    "段取り&分析力": 0,
  };

  const total = Object.values(rawScores).reduce((a, b) => a + (b ?? 0), 0);

  // 回答が全て0等でtotalが0の場合は、既存挙動に近い「最低限の形」を返す
  // （ここで固定値にせず0のまま返すのが最も非破壊）
  if (total <= 0) return out;

  // 加重平均（重み = rawScores）
  for (const charName of Object.keys(rawScores)) {
    const w = rawScores[charName] ?? 0;
    if (w <= 0) continue;

    const fs = CHARACTER_STRENGTH_SCORES[charName];
    if (!fs) continue;

    for (const k of FIVE_KEYS) {
      out[k] += (fs[k] ?? 0) * w;
    }
  }

  // 正規化して 0〜3 の整数に丸める（既存データのスケール感を維持）
  for (const k of FIVE_KEYS) {
    const v = out[k] / total;
    // 既存は概ね0〜3想定なのでそれにクランプ
    out[k] = Math.max(0, Math.min(3, Math.round(v)));
  }

  return out;
}

/**
 * 診断結果（第1段階）
 *
 * answers: { [questionId: number]: "A" | "B" | "C" }
 * questions: 質問定義配列（省略時はデフォルト）
 *  └ 第1段階（id: 1〜8）の回答を使って
 *     16キャラクターに直接スコア付けを行う。
 */
export function calculateDiagnosisResult(
  answers: Record<number, string>,
  questions: Question[] = defaultQuestions
): DiagnosisResult {
  const typeNames = CHARACTERS.map((c) => c.name);

  // ① 各タイプの素点を0で初期化
  const rawScores: Record<string, number> = {};
  typeNames.forEach((t) => {
    rawScores[t] = 0;
  });

  // ② 回答をもとにキャラへ直接加点
  Object.entries(answers).forEach(([qIdStr, answer]) => {
    const qId = Number(qIdStr);

    // 質問データからスコア情報を検索
    const questionObj = questions.find((q) => q.id === qId);
    if (!questionObj) return;

    // answer は "A", "B", "C" などの value
    const option = questionObj.options.find((o) => o.value === answer);

    // scores プロパティがあれば加点 (構造: { "キャラ名": 点数, ... })
    if (option && option.scores) {
      Object.entries(option.scores).forEach(([charName, score]) => {
        if (rawScores[charName] != null) {
          rawScores[charName] += score;
        } else {
          // もし万が一初期化されていないキャラ名があればここで初期化
          rawScores[charName] = score as number;
        }
      });
    }
  });

  // ③ 正規化（最大値で割る）※並び順決定にのみ使用
  const maxScore = Math.max(0, ...Object.values(rawScores));
  const normalized: Record<string, number> = {};
  typeNames.forEach((t) => {
    normalized[t] = maxScore > 0 ? rawScores[t] / maxScore : 0;
  });

  // ④ スコア順に並べる（同点時のタイブレークは生点→名前順）
  const sorted = [...typeNames].sort((a, b) => {
    const diff = normalized[b] - normalized[a];
    if (Math.abs(diff) > 0.0001) return diff > 0 ? 1 : -1;
    if (rawScores[a] !== rawScores[b]) return rawScores[b] - rawScores[a];
    return a.localeCompare(b, "ja");
  });

  const nonZero = sorted.filter((t) => rawScores[t] > 0);
  const primaryType = nonZero[0] || "家計の金庫番長";

  // ⑤ 5因子スコアを「回答に応じて変動」する形に変更（ここだけが主変更点）
  const factorScores: FiveScores = buildDynamicFiveScoresFromRawScores(rawScores);

  return {
    primaryType: primaryType,
    secondaryTypes: nonZero.slice(1, 3),
    scores: rawScores,
    factorScores,
  };
}

/** 素点→マーク数（最大=5、最低1保証） */
export function toIconsMin1(
  scores: FiveScores
): Record<keyof FiveScores, number> {
  const vals = Object.values(scores);
  const Smax = Math.max(0, ...vals);
  const icons = {} as Record<keyof FiveScores, number>;

  for (const k of FIVE_KEYS) {
    const s = scores[k];
    const ratio = Smax === 0 ? 0 : s / Smax;
    const n = Smax === 0 ? 0 : Math.max(1, Math.round(ratio * 5));
    icons[k] = Math.min(5, Math.max(0, n));
  }
  return icons;
}

/**
 * 回答ベースの5因子スコア計算
 *  └ キャラクタースコア → 5因子へ写像する形に変更
 */
export function calculateFiveFactorsFromAnswers(
  answersMap: Record<number, string>
) {
  // 第1段階の回答から診断を実行
  const result = calculateDiagnosisResult(answersMap);

  // 診断結果の factorScores をそのまま使う
  const fiveScores = result.factorScores as FiveScores;
  const icons = toIconsMin1(fiveScores);

  return { fiveScores, icons };
}

/** X（Twitter）シェア */
export function shareToTwitter(result: string): void {
  const text = `私の隠れた才能は「${result}」でした！\n\n主婦の皆さんも一緒に診断してみませんか？`;
  const url = window.location.href;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(url)}`;
  window.open(twitterUrl, "_blank");
}
