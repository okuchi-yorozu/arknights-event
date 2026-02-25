# コードレビュー - アークナイツイベント攻略動画投稿システム

> レビュー日: 2026-02-25
> レビュー対象: リポジトリ全体

---

## サマリー

全体的にアーキテクチャは良好で、React 19 への移行や TypeScript strict モード対応が適切に実装されている。
ただし、**DELETE API の認証不足は即座に対応が必須**。その他、localStorage の機密データ保存や期限チェックの矛盾も早期修正を推奨。

---

## 改善優先度表

| 優先度 | 項目 | 対応期限 |
|--------|------|----------|
| 🔴 Critical | DELETE API の認証不足 | 即座に修正 |
| 🟠 High | localStorage に editKey 平文保存 | 1週間以内 |
| 🟠 High | my-submissions の編集期限矛盾（14日 vs 30日） | 1週間以内 |
| 🟠 High | Firebase 設定が3ファイルで重複 | 2週間以内 |
| 🟠 High | 管理者パスワードのタイミング攻撃 | 2週間以内 |
| 🟡 Medium | console.log で機密情報が本番に露出 | 2週間以内 |
| 🟡 Medium | Firestore ルールに文字数制限がない | 1ヶ月以内 |
| 🟡 Medium | JSON.parse() に try-catch がない | 1ヶ月以内 |
| 🟡 Low | stage prefix の magic string 散在 | 次回リファクタリング時 |
| 🟡 Low | 日付判定が UTC 依存 | 次回リファクタリング時 |

---

## 1. セキュリティ

### 🔴 Critical - DELETE API に認証がない

**ファイル**: `src/app/api/submissions/[id]/route.ts`

**問題**: DELETE メソッドに認証チェックが存在しない。誰でも任意の投稿を削除できる。

```typescript
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await deleteDoc(doc(db, "submissions", id));  // 認証チェックなし
    return NextResponse.json({ success: true });
  }
  // ...
}
```

**原因**: `middleware.ts` がすべての `/api/` を認証スキップしているため、各 API ルートで個別に認証を実装する必要がある。

```typescript
// middleware.ts
if (
  request.nextUrl.pathname === "/admin/login" ||
  request.nextUrl.pathname.startsWith("/api/")  // ← すべてのAPIがスキップ
) {
  return NextResponse.next();
}
```

**推奨修正**: DELETE ハンドラ内で JWT クッキーを検証する。

---

### 🟠 Important - localStorage に editKey を平文保存

**ファイル**: `src/components/organisms/VideoSubmissionForm.tsx`, `src/app/my-submissions/page.tsx`

**問題**: editKey が localStorage に平文で保存されており、XSS 攻撃で盗取される可能性がある。

```typescript
localStorage.setItem("mySubmissions", JSON.stringify(savedSubmissions));
// ↑ editKey が平文で含まれる
```

**推奨**: localStorage には ID のみ保存し、editKey は HTTP-only クッキーで管理する。

---

### 🟠 Important - 管理者パスワードのタイミング攻撃

**ファイル**: `src/app/api/admin/auth/route.ts`

**問題**: `!==` による単純な文字列比較はタイミング攻撃に脆弱。環境変数に平文パスワードが保存されている。

```typescript
if (password !== ADMIN_PASSWORD) {  // タイミング攻撃に脆弱
  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}
```

**推奨**: `crypto.timingSafeEqual()` または bcrypt を使用する。

---

### 🟡 Minor - console.log で機密情報が本番に露出

**ファイル**: `src/middleware.ts`

```typescript
console.log("Decoded token:", decoded);  // 本番環境でもデバッグ情報が出力される
console.error("Token verification error:", error);
```

**推奨**: 環境変数で制御するか、本番環境では無効化する。

---

## 2. バグ・データ整合性

### 🟠 Important - 編集期限の矛盾（14日 vs 30日）

**ファイル**: `src/app/my-submissions/page.tsx`

**問題**: ロジックと表示メッセージ、サーバー側の3箇所で期限の値が一致していない。

```typescript
// クライアント判定: 14日
const isExpired = (createdAt: string) => {
  const daysDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff > 14;  // ← 14日
};

// エラーメッセージ: 30日
messageApi.error("編集期限（30日）を過ぎているため、編集できません");

// サーバー側 (api/submissions/[id]/route.ts): 30日（正しい）
```

**推奨**: クライアント側を 30 日に統一する。

---

### 🟡 Minor - JSON.parse() に try-catch がない

**ファイル**: `src/app/my-submissions/page.tsx`, `src/components/organisms/VideoSubmissionForm.tsx`

```typescript
const submissions = JSON.parse(saved);  // パース失敗時に例外が発生
```

**推奨**: try-catch でラップし、失敗時は空配列にフォールバックする。

---

## 3. アーキテクチャ

### 🟠 Important - Firebase 設定が3ファイルで重複

**ファイル**:
- `src/app/api/submissions/route.ts`
- `src/app/api/submissions/[id]/route.ts`
- `src/app/api/my-submissions/route.ts`

**問題**: 同じ Firebase 初期化コードが3箇所に重複している。

**推奨**: `src/lib/firebase/server.ts` に共通化する。

---

### 🟡 Minor - stage prefix の magic string が複数箇所に散在

**ファイル**: `src/app/my-submissions/page.tsx`

```typescript
if (stage?.startsWith("ep-")) { ... }
if (stage?.startsWith("pv-")) { ... }
// 複数箇所で繰り返し
```

**推奨**: 定数マップに抽出する。

```typescript
const EVENT_PREFIX_MAP = {
  "ep-": { name: "白き海の彼方へ", color: "cyan" },
  // ...
};
```

---

### 🟡 Minor - 日付判定が UTC 依存

**ファイル**: `src/lib/utils/date.ts`

**問題**: `new Date()` はタイムゾーン依存のため、日本以外からアクセスすると判定がズレる可能性がある。

**推奨**: タイムゾーンを明示的に指定する。

---

## 4. Firestore セキュリティルール

### 🟡 Minor - 文字数制限がない

**ファイル**: `firestore.rules`

**問題**: `concept`（最大50文字）や `introduction`（最大50文字）の長さがルール側で検証されていない。クライアント側バリデーションのみに依存している。

**推奨**: Firestore ルールに長さ制限を追加する。

```
request.resource.data.concept.size() <= 50 &&
request.resource.data.introduction.size() <= 50
```

---

## 5. 良い実装（Strengths）

| 項目 | 詳細 |
|------|------|
| ✅ Server/Client コンポーネント分離 | サーバー側でイベント設定を取得し、Props 経由でクライアントへ渡す設計が適切 |
| ✅ Atomic Design の採用 | atoms / molecules / organisms / templates が適切に分離されている |
| ✅ Firestore ルールでの型バリデーション | enum 値・必須フィールド・データ型をデータベースレベルで検証 |
| ✅ TypeScript strict モード | `strict: true` が有効で型安全性が確保されている |
| ✅ JWT の HttpOnly クッキー | セッション情報を HttpOnly + SameSite=Strict で保護 |
| ✅ useMemo による再レンダリング最適化 | `useEventData.ts` で計算結果をメモ化 |
| ✅ 動的イベントルーティング | `config/events.json` を変更するだけでコード変更なしにイベント追加可能 |

---

## 対応ステータス

- [ ] 🔴 DELETE API に認証を追加
- [ ] 🟠 localStorage の editKey 保存方法を改善
- [ ] 🟠 編集期限を30日に統一（クライアント側）
- [ ] 🟠 Firebase 設定を共通化
- [ ] 🟠 管理者パスワード比較をタイミング安全にする
- [ ] 🟡 console.log を本番環境で無効化
- [ ] 🟡 Firestore ルールに文字数制限を追加
- [ ] 🟡 JSON.parse() を try-catch でラップ
- [ ] 🟡 stage prefix を定数化
- [ ] 🟡 日付判定をタイムゾーン対応に
