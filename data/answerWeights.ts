// src/data/answerWeights.ts

// 質問ID（"1"〜"18"） × 選択肢ID（"A" | "B" | "C"）→ 各Traitに何点足すか
// ※ 1〜18 = キャラクター診断用の質問
//    101〜104 = 働き方条件（conditionタグ用）なので、ここではスコア加算しない

export const answerWeights: {
  [questionId: string]: {
    [optionId: string]: { [traitKey: string]: number };
  };
} = {
  // ===============================
  // 第1段階（キャラクター診断） Q1〜Q8
  //  ※ ここは従来ロジックをそのまま利用
  // ===============================
  "1": {
    // 夕食の買い物。あなたの行動は？
    A: { LOGIC_DETAIL: 2 },                    // 在庫確認＆必要分購入 → 段取り・管理
    B: { COMMUNICATION: 1 },                   // 特売チェック＆お得メニュー → 情報収集＋工夫
    C: { LOGIC_DETAIL: 1, CARE_SUPPORT: 1 },   // 予算＆家族希望＆バランス → 計画＋ケア
  },
  "2": {
    // 学校のプリント。まず、どこに目が行く？
    A: { LOGIC_DETAIL: 2 },
    B: { COMMUNICATION: 1 },
    C: { LOGIC_DETAIL: 1 },
  },
  "3": {
    // 友達とのランチ会。あなたの役割は？
    A: { LOGIC_DETAIL: 1 },
    B: { LOGIC_DETAIL: 1 },
    C: { COMMUNICATION: 2 },
  },
  "4": {
    // 初めての場所へのお出かけ。どう準備する？
    A: { LOGIC_DETAIL: 2 },
    B: { LOGIC_DETAIL: 1 },
    C: { CARE_SUPPORT: 1 }, // 行動派・場の雰囲気重視寄りとしてケアに寄与
  },
  "5": {
    // 子どもの学校行事。あなたの立ち位置は？
    A: { CARE_SUPPORT: 2 },
    B: { COMMUNICATION: 2 },
    C: { LOGIC_DETAIL: 1 },
  },
  "6": {
    // 家の中を整えるタイミングは？
    A: { LOGIC_DETAIL: 1, CARE_SUPPORT: 1 },
    B: { LOGIC_DETAIL: 2 },
    C: { CARE_SUPPORT: 1 },
  },
  "7": {
    // 家族の誕生日プレゼント。どう決める？
    A: { LOGIC_DETAIL: 1 },
    B: { CARE_SUPPORT: 1 },
    C: { COMMUNICATION: 1 },
  },
  "8": {
    // 誰かに相談されたときの対応は？
    A: { CARE_SUPPORT: 2 },
    B: { LOGIC_DETAIL: 1, CARE_SUPPORT: 1 },
    C: { LOGIC_DETAIL: 1 },
  },

  // ===============================
  // 第1段階（キャラクター診断） Q9〜Q14
  // （元の「価値観」質問の重みを流用）
  // ===============================
  "9": {
    // 家事の進め方で近いのは？
    A: {},                        // チーム志向は今回は traits には乗せない
    B: { LOGIC_DETAIL: 1 },
    C: { COMMUNICATION: 2 },
  },
  "10": {
    // ママ友・友達との付き合い方は？
    A: { LOGIC_DETAIL: 1 },
    B: { CARE_SUPPORT: 1 },
    C: { LOGIC_DETAIL: 1 },
  },
  "11": {
    // 休日の過ごし方の傾向は？
    A: { CARE_SUPPORT: 1 },
    B: { LOGIC_DETAIL: 1 },
    C: { LOGIC_DETAIL: 1 },
  },
  "12": {
    // 家族旅行の役割は？
    A: { LOGIC_DETAIL: 2 },
    B: { COMMUNICATION: 1 },
    C: { LOGIC_DETAIL: 1 },
  },
  "13": {
    // 新しいことへの挑戦スタイルは？
    A: { CARE_SUPPORT: 1, COMMUNICATION: 1 },
    B: { COMMUNICATION: 1 },
    C: { LOGIC_DETAIL: 1 },
  },
  "14": {
    // 買い物中に気になるのは？
    A: { CARE_SUPPORT: 1 },
    B: { LOGIC_DETAIL: 1 },
    C: { COMMUNICATION: 1 },
  },

  // ===============================
  // 第1段階（キャラクター診断） Q15〜Q18
  // ※ ここが「今の質問文」に合わせて付け直した部分
  // ===============================

  "15": {
    // 家族内でのあなたの役割は？
    A: { LOGIC_DETAIL: 2 },                        // 全体の管理・調整
    B: { COMMUNICATION: 1, CARE_SUPPORT: 1 },      // 居心地のよい空間づくり（雰囲気＋ケア）
    C: { CARE_SUPPORT: 2 },                        // 相談役
  },

  "16": {
    // 突然トラブルが起きたら？
    A: { LOGIC_DETAIL: 2 },                        // 状況整理して問題点を見つける
    B: { COMMUNICATION: 1, CARE_SUPPORT: 1 },      // 連絡＆フォローしながら動く
    C: { CARE_SUPPORT: 1 },                        // 気持ちを切り替え前向きに対応（メンタル寄り）
  },

  "17": {
    // 子どもの習い事の選び方は？
    A: { LOGIC_DETAIL: 1, CARE_SUPPORT: 1 },       // 無理なく続けられるスケジュール優先
    B: { COMMUNICATION: 1, CARE_SUPPORT: 1 },      // 雰囲気・相性重視
    C: { LOGIC_DETAIL: 2 },                        // 将来役に立ちそうな内容・スキル重視
  },

  "18": {
    // 新しい家電・雑貨を買うときは？
    A: { LOGIC_DETAIL: 2 },                        // スペック表・比較サイト
    B: { COMMUNICATION: 2 },                       // 口コミ・評判・レビュー重視
    C: { CARE_SUPPORT: 1 },                        // デザイン・色・インテリアとの相性
  },

  // ※ 101〜104（働き方条件の質問）は、
  //    traits ではなく ConditionTag（PC_ENV / AVOID_STANDING 等）で扱うため
  //    answerWeights には定義しない（＝スコア加算しない）
};
