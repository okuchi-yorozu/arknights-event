# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 言語設定

Claude Code との対話・ドキュメント・コメント・Git コミットメッセージはすべて日本語で統一する。

## 開発コマンド

```bash
npm run dev          # 開発サーバー起動（Turbopack）
npm run build        # 本番ビルド
npm run fix          # フォーマット＋リント（Biome）
npm run type-check   # TypeScript 型チェック
npm run test         # type-check + fix（テストフレームワークなし）
```

## アーキテクチャ

### 全体構成

Next.js 15 App Router + Firebase Admin SDK（APIルート経由）。クライアントから Firebase に直接アクセスしない。

```
src/
  app/
    [eventId]/          # 動的イベントルート
      page.tsx          # サーバーコンポーネント（config 検証）
      ClientEventPage.tsx
      calculate/        # 契約計算機
      videos/           # 投稿一覧
    admin/              # JWT 認証が必要な管理画面
    api/                # Firebase と通信するAPIルート
  components/
    atoms/              # 基本フォーム要素（FormInput, FormButton 等）
    molecules/          # フォームフィールド（YoutubeUrlField, ConceptField 等）
    organisms/          # 複合コンポーネント（VideoSubmissionForm 等）
    templates/          # レイアウト（FormLayout）
  hooks/                # useSubmissions, useSubmissionCount
  lib/
    auth/jwt.ts         # jose ライブラリによる JWT 操作
    firebase/           # クライアント側 Firebase ラッパー（APIを呼ぶだけ）
  types/                # submission.ts, events.ts, api.ts
  utils/                # validators.ts, twitter.ts
config/events.json      # イベント設定（コード変更不要でイベント追加可能）
```

### イベント設定システム

`/config/events.json` がすべてのイベント定義を持つ。`active: false` のイベントは 404 になる。新規イベント追加手順：
1. `config/events.json` にエントリ追加
2. `/public/events/[eventId]/` に画像配置
3. コード変更不要

`calculator` フィールドが `null` でない場合のみ `/[eventId]/calculate` が意味を持つ。

### APIルート一覧

| メソッド | パス | 説明 |
|---|---|---|
| POST/GET | `/api/submissions` | 投稿作成・一覧取得 |
| DELETE | `/api/submissions/[id]` | 投稿削除（管理者のみ） |
| POST | `/api/my-submissions` | editKey で自分の投稿取得 |
| POST | `/api/admin/auth` | 管理者ログイン |
| GET | `/api/admin/auth/check` | 認証確認 |

### 認証フロー

- `src/middleware.ts` が `/admin/*` を保護（`/admin/login` と `/api/*` は除外）
- JWT を HTTP-only クッキー `admin_token` に保存
- パスワード単一・ユーザー管理なし

### データモデル（Submission）

```typescript
{
  id?: string;
  editKey?: string;
  youtubeUrl: string;
  concept: string;            // 最大50文字
  hasEditing: "edited" | "raw";
  stage: string;              // イベントIDのプレフィックスで eventId にフィルタリング
  difficulty: "normal" | "challenge";
  twitterHandle?: string;
  doctorHistory: "less-than-6months" | "6months-1year" | "1-2years" | "2-3years" | "more-than-3years";
  introduction?: string;      // 最大50文字
  createdAt: Date;
}
```

### 環境変数

APIルートでのみ使用（`NEXT_PUBLIC_` プレフィックスなし）：

```
JWT_SECRET=
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
```

### コードスタイル（Biome 強制）

- インデント: タブ
- 文字列: ダブルクォート
- クライアントコンポーネントには `@ant-design/v5-patch-for-react-19` をインポート

## Git・GitHub 運用ルール

- **main ブランチへの直接コミット禁止**
- ブランチ命名: `feature/機能名`, `fix/バグ名`, `docs/説明`
- PR 作成後は即 `git checkout main && git pull origin main`
- PR ブランチへの追加変更は行わず、新しいブランチを作成する
