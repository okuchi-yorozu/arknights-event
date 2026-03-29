# 認証リファクタリング 検討メモ

最終更新: 2026-03-29

## 現状

| 用途 | 現在の実装 | 問題点 |
|---|---|---|
| 管理者ログイン | JWT + パスワード単一認証 | パスワード管理・セキュリティ |
| 投稿者の動画編集 | editKey（投稿時発行） | 別デバイス編集不可・キャッシュ削除で消失 |
| DELETE API | 認証なし（誰でも削除可能） | セキュリティ上の問題 |

## 決定事項

- 管理者: Firebase Authentication の Google OAuth に移行（フェーズ1 完了）
- 投稿者: Firebase Authentication の匿名認証（signInAnonymously）に移行（フェーズ2 未着手）
- 既存の editKey ベースの投稿データは切り捨て（編集不可、閲覧は可能）

## 実装状況

### フェーズ1: 管理者認証（完了）

- [x] `firebase-admin` インストール
- [x] `src/lib/firebase/admin.ts` 作成（サーバーサイド用）
- [x] `src/lib/firebase/client.ts` 作成（クライアントサイド用）
- [x] `POST /api/admin/auth`: IDトークン検証 + セッションCookie発行
- [x] `GET /api/admin/auth/check`: verifySessionCookie
- [x] `src/middleware.ts`: `admin_session` Cookie 存在確認
- [x] `src/app/admin/google-login.tsx` 作成
- [x] `src/app/admin/login/page.tsx` 書き換え
- [x] `password.tsx`, `jwt.ts` 削除
- [x] `jose`, `jsonwebtoken` アンインストール

### フェーズ2: 投稿者認証（未着手）

- [ ] Firebase Console で匿名認証プロバイダを有効化
- [ ] `src/lib/firebase/auth-context.tsx` 作成（AuthProvider + useAuth）
- [ ] `src/app/layout.tsx` に AuthProvider 追加
- [ ] `src/types/submission.ts`: `editKey` 削除、`uid` 追加
- [ ] `src/app/api/submissions/route.ts`: Admin SDK + uid 保存
- [ ] `src/app/api/submissions/[id]/route.ts`: uid 検証（DELETE も保護）
- [ ] `src/app/api/my-submissions/route.ts`: uid クエリ
- [ ] `src/lib/firebase/submissions.ts`: idToken を引数に追加
- [ ] `src/components/organisms/VideoSubmissionForm.tsx`: editKey/localStorage 削除
- [ ] `src/app/my-submissions/page.tsx`: localStorage 削除、idToken ベースに
- [ ] `uuid` パッケージをアンインストール
