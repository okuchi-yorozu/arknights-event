# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリのコードを扱う際のガイダンスを提供します。

## 言語設定

**重要**: Claude Code との対話は基本的に日本語で行い、ドキュメントや説明の出力も日本語で統一してください。コードコメントや Git コミットメッセージも日本語を使用することを推奨します。

## Git・GitHub 運用ルール

### プルリクエスト作成時の注意点

1. **ブランチの最新化**: 作業開始前に分岐元ブランチの最新版をpullする
2. **ブランチ命名**: GitHub Flow に則った命名規則を使用
   - `feature/機能名-説明` （例: `feature/add-user-auth`）
   - `fix/バグ修正-説明` （例: `fix/login-validation-error`）
   - `docs/ドキュメント-説明` （例: `docs/update-readme`）
3. **コミット単位**: 適切な作業単位でコミットを作成（1コミット1機能/修正）
4. **日本語での PR**: タイトル・説明文は日本語で記述
5. **コミットメッセージ**: 日本語で分かりやすく記述
6. **PR作成後の手順**: PRを作成したらmainブランチに戻る
   ```bash
   git checkout main
   git pull origin main
   ```

### 改良された開発フロー

**作業開始時:**
```bash
git checkout main
git pull origin main
git checkout -b feature/新機能名
```

**開発中:**
- 機能実装とドキュメント更新を含む関連変更をすべて完了
- 追加変更は同じブランチで行わず、PR作成前に完了させる

**PR作成手順:**
```bash
# 全ての変更をコミット・プッシュ
git add .
git commit -m "変更内容"
git push origin feature/新機能名

# PR作成
gh pr create --title "タイトル" --body "説明"

# PR作成直後に即座にmainに戻る
git checkout main
git pull origin main
```

**追加変更が必要な場合:**
```bash
# 新しいブランチを作成（既存のPRブランチは使わない）
git checkout -b feature/追加変更名
```

### 注意点
- **PR作成後の同一ブランチでの追加変更は避ける**
- 設定ファイル変更時はコンフリクトに注意
- こまめなmain同期でコンフリクトを予防

## プロジェクト概要

これは Next.js 15、React 19、Firebase で構築されたアークナイツイベント攻略動画投稿システムです。ゲームイベントのYouTube動画投稿を収集し、管理者用インターフェースを提供します。

## 開発コマンド

```bash
# 開発サーバーの起動（Turbopack使用）
npm run dev

# 本番用ビルド
npm run build

# 本番サーバーの起動
npm run start

# コードフォーマット（Biome使用、タブインデント）
npm run format

# リンティング（Biome使用）
npm run lint

# フォーマット＋リンティング
npm run fix
```

## カスタムコマンド

```bash
# 今日の開発ログを作成
/dev-log
```

## 高次アーキテクチャ

### 技術スタック
- **フロントエンド**: Next.js 15.3.1 with React 19, TypeScript
- **UIライブラリ**: Ant Design v5 with React 19 patch
- **スタイリング**: TailwindCSS
- **データベース**: Firebase Firestore (client SDK)
- **認証**: JWT-based admin auth using `jose` library
- **コード品質**: Biome for formatting/linting (ESLint/Prettier を置き換え)

### プロジェクト構造パターン

このプロジェクトは Atomic Design の原則に従っています：
- **Atoms** (`/components/atoms/`): 基本的なフォームコンポーネント（FormButton, FormInput, など）
- **Molecules** (`/components/molecules/`): フィールドコンポーネント（YoutubeUrlField, ConceptField, など）
- **Organisms** (`/components/organisms/`): 複雑なコンポーネント（VideoSubmissionForm, EventSubmissionGuidelines）
- **Templates** (`/components/templates/`): レイアウトコンポーネント（FormLayout）

### 重要なアーキテクチャ決定

1. **サーバーサイドFirebase操作**: すべてのFirebase操作はNext.jsのAPIルートを通します。クライアントコンポーネントからFirebaseに直接アクセスしないでください。

2. **パスエイリアス**: インポートには `@/` を使用（`src/` にマップ）：
   ```typescript
   import { FormLayout } from "@/components/templates";
   ```

3. **動的イベントシステム**: イベントは中央集権的な設定システムで管理されます：
   - イベントメタデータは `/config/events.json` に保存
   - `/app/[eventId]/page.tsx` と `/app/[eventId]/calculate/page.tsx` による動的ルーティング
   - Next.js 15の非同期互換性のためのサーバー/クライアントコンポーネント分離
   - イベント画像は `/public/events/[eventId]/` に配置

4. **イベント設定スキーマ**: `/config/events.json` の各イベントは以下の構造に従います：
   ```typescript
   {
     id: string;                    // イベント識別子（as, ep, go, pv）
     title: string;                 // 表示タイトル
     deadline: string | null;       // 締切テキストまたは null
     thumbnailUrl: string;          // イベント画像のパス
     stages: Array<{value: string, label: string}>;  // 利用可能なステージ
     defaultStage: string;          // デフォルト選択ステージ
     active: boolean;               // イベントがアクティブかどうか
     calculator?: {                 // オプション：計算機設定
       title: string;
       fiveStarOperatorImages: string[];
     } | null;
   }
   ```

5. **新しいイベントの追加**: 新しいイベントを追加するには：
   1. `/config/events.json` にイベント設定を追加
   2. イベント画像を `/public/events/[eventId]/` に配置
   3. コード変更不要 - システムが自動的にルーティングを処理

6. **認証フロー**:
   - 管理者ログイン：`/admin/login`
   - JWT を HTTP-only クッキーに保存
   - ミドルウェアが `/admin/*` ルートを保護
   - 単一管理者パスワード（ユーザー管理なし）

### APIルート

- `POST /api/submissions` - 新しい投稿作成
- `GET /api/submissions` - 投稿一覧取得
- `DELETE /api/submissions/[id]` - 投稿削除（管理者のみ）
- `POST /api/admin/auth` - 管理者ログイン
- `GET /api/admin/auth/check` - 認証状態確認

### データモデル

投稿は以下の構造に従います：
```typescript
{
  youtubeUrl: string;      // 必須、検証済みYouTube URL
  concept: string;         // 必須、最大50文字
  hasEditing: "edited" | "raw";
  stage: string;           // イベント固有のステージ
  difficulty: "normal" | "challenge";
  twitterHandle?: string;  // オプション
  doctorHistory: string;   // 経験レベル enum
  introduction?: string;   // オプション、最大50文字
  createdAt: Date;
}
```

### コンポーネント規約

1. **クライアントコンポーネント**: `"use client"` ディレクティブを使用
2. **Ant Design パッチ**: クライアントコンポーネントで `@ant-design/v5-patch-for-react-19` をインポート
3. **フォームバリデーション**: Ant Design Form と `/utils/validators.ts` のカスタムバリデーターを使用
4. **タイポグラフィ**: テキストには Ant Design Typography コンポーネントを使用
5. **エラーハンドリング**: Ant Design message コンポーネントでユーザーフレンドリーなメッセージを表示

### Firebase セキュリティ

- Firestore ルールは投稿の作成のみを許可（クライアント側の更新/削除は不可）
- データベースレベルでの必須フィールドバリデーション
- パブリック読み取りアクセス、認証済み書き込みアクセス
- 管理者操作は認証済みAPIルートのみ

### 環境変数

`.env.local` に必要：
```
JWT_SECRET=your-secret-key
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### コードスタイル

- **インデント**: タブ（Biome によって強制）
- **クォート**: 文字列にはダブルクォート
- **インポート**: Biome によって自動整理
- **コンポーネント**: TypeScript を使用した関数コンポーネント
- **ファイル命名**: コンポーネントは PascalCase、ユーティリティは camelCase