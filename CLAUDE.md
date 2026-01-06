# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

主婦向けの適職診断Webアプリケーション。2段階の診断フローを通じて、ユーザーの特性に合った職種をレコメンドする。

## 開発コマンド

```bash
npm install    # 依存関係インストール
npm run dev    # 開発サーバー起動 (http://localhost:3000)
npm run build  # 本番ビルド
npm run preview # ビルド結果プレビュー
```

## アーキテクチャ

### 2段階診断フロー

1. **第1段階 (DiagnosisFlow)**: 8問の性格診断 → 10種類のキャラクター（家計の金庫番長、ご近所の広報部長など）から primaryType を決定
2. **第2段階 (ConditionDiagnosisFlow)**: 5問の働き方条件診断 → ConditionTag（REMOTE_OK、SHORT_HOURS_OK など）を収集し、職種をランキング

### 主要ディレクトリ構成

- `flows/` - 診断フローのステート管理コンポーネント
- `components/` - UI コンポーネント群
- `services/jobMatching.ts` - 職種マッチングロジック（スコア計算、ランキング）
- `utils/diagnosisLogic.ts` - 第1段階の診断結果計算
- `utils/profileBuilder.ts` - 回答から UserProfile を構築
- `data/` - マスターデータ（キャラクター、職種、質問など）
- `types/diagnosis.ts` - 型定義の中心

### 重要な型定義 (types/diagnosis.ts)

- `CharacterMeta` - 10種類のキャラクターのメタデータ
- `JobMasterEntry` - 職種マスタ（characterScores、conditionAffinity を持つ）
- `UserProfile` - traits（TraitKey）と conditions（ConditionTag[]）
- `ConditionTag` - 働き方条件のユニオン型（REMOTE_OK, SHORT_HOURS_OK など）

### マッチングロジック (services/jobMatching.ts)

職種スコアは以下の順で決定される：
1. キャラクター適性（characterScores）が最優先（足切りあり）
2. ハードミスマッチ除外（在宅希望 vs 現場必須など）
3. 条件ブーストで希望条件に合う職種を上位へ

### データ生成

以下のファイルは自動生成される。直接編集不可：
- `data/Characters.ts` - parseTsv.ts から生成
- `data/jobMaster.ts` - generateJobMasterFromNewCsv.ts から生成
- `data/questions.ts` - parseQuestionsTsv.ts から生成
- `data/conditionQuestions.ts` - generateConditionQuestions.ts から生成

## パスエイリアス

`@/*` → プロジェクトルートからの相対パス（tsconfig.json / vite.config.ts で設定）

## ルーティング

HashRouter を使用。主要ルート：
- `/` - ホーム
- `/diagnosis` - 第1段階診断
- `/diagnosis/conditions` - 第2段階診断
- `/diagnosis/final-result` - 最終結果
- `/characters` - キャラクター一覧
- `/characters/:name` - キャラクター詳細
