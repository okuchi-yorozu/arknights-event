# フロントエンドリファクタリング提案書

## 概要

本ドキュメントは、アークナイツイベント攻略動画投稿システムの現代的なフロントエンド開発パターンに基づくリファクタリング提案です。Next.js 15、React 19、および最新のWebパフォーマンス最適化手法を活用して、コードの保守性、パフォーマンス、開発者体験を向上させることを目的としています。

## 現状分析

### 技術スタック（現在）
- **フレームワーク**: Next.js 15.3.1 (App Router)
- **React**: 19.0.0
- **UIライブラリ**: Ant Design 5.23.4 + React 19パッチ
- **スタイリング**: Tailwind CSS 3.4.1
- **データベース**: Firebase 11.3.0
- **認証**: JWT (jose library)
- **型安全性**: TypeScript 5
- **コード品質**: Biome 1.9.4

### 現在のアーキテクチャの評価

#### ✅ 良い点
1. **Atomic Design**: コンポーネント設計がatomic designパターンに従っている
2. **TypeScript**: 型安全性が確保されている
3. **現代的スタック**: Next.js 15 + React 19の最新バージョンを使用
4. **設定の集約**: `events.json`による設定の一元管理

#### ⚠️ 改善が必要な点
1. **Server Components活用不足**: 静的コンテンツでもClient Componentsを多用
2. **データフェッチパターン**: useEffect中心のクライアントサイドフェッチ
3. **コードの重複**: 日付パース関数が複数ファイルに散在
4. **パフォーマンス最適化機会**: メモ化、コード分割の余地
5. **React 19新機能未活用**: Server Actions、useOptimisticなど

---

## 1. Server Components vs Client Components の最適化

### 🎯 目標
適切なサーバー/クライアント境界の設定による初期ロード時間の改善とJavaScriptバンドルサイズの削減

### 📊 現状の問題
```typescript
// ❌ 現在: src/app/page.tsx (静的コンテンツなのにClient Component)
"use client";

import eventsConfig from "../../config/events.json";
// 静的データのみを扱うのにクライアントサイドで実行されている
```

### ✨ 改善提案

#### A. ホームページのServer Component化

**Before (現在):**
```typescript
// ❌ Client Component
"use client";
export default function HomePage() {
  // 静的データの処理がクライアントサイド
}
```

**After (提案):**
```typescript
// ✅ Server Component
import { EventCard } from '@/components/EventCard';
import { parseDeadline, getCurrentDate, isEventActive } from '@/lib/utils/date';

export default async function HomePage() {
  // サーバーサイドで事前処理
  const events = await getProcessedEvents();
  
  return (
    <main className="min-h-screen bg-gray-50">
      <EventSection 
        title="現在進行中のイベント" 
        events={events.active} 
      />
      <EventSection 
        title="過去のイベント" 
        events={events.past} 
        isPast 
      />
    </main>
  );
}
```

#### B. クライアント境界の最適化

```typescript
// ✅ Suspenseによる段階的レンダリング
export default async function VideosPage({ params }: Props) {
  const { eventId } = await params;
  const event = await getEvent(eventId);
  
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<VideoListSkeleton />}>
          <VideoListServer eventId={eventId} eventTitle={event.title} />
        </Suspense>
      </div>
    </main>
  );
}
```

**影響度**: 🔥 高（初期ロード時間の大幅改善）
**実装難易度**: 🟡 中

---

## 2. React 19 新機能の活用

### 🎯 目標
React 19の新機能を活用したUX向上とコードの簡潔化

### A. useOptimistic による楽観的UI更新

**適用箇所**: 動画投稿フォーム、削除操作

```typescript
// ✅ 楽観的UI更新の実装
"use client";
import { useOptimistic } from 'react';

function VideoSubmissionForm({ initialSubmissions }) {
  const [optimisticSubmissions, addOptimisticSubmission] = useOptimistic(
    initialSubmissions,
    (state, newSubmission) => [...state, newSubmission]
  );

  const submitAction = async (formData) => {
    const newSubmission = createSubmissionFromFormData(formData);
    
    // 即座にUIを更新
    addOptimisticSubmission({
      ...newSubmission,
      id: 'temp-' + Date.now(),
      pending: true
    });
    
    try {
      const result = await createSubmission(newSubmission);
      // 成功時は楽観的更新がそのまま反映される
    } catch (error) {
      // エラー時は自動的に元の状態に戻る
      showErrorMessage(error.message);
    }
  };

  return (
    <form action={submitAction}>
      {/* フォームフィールド */}
    </form>
  );
}
```

### B. useActionState によるフォーム状態管理

```typescript
// ✅ Server Actionsとの統合
"use server";
export async function createSubmissionAction(prevState, formData) {
  try {
    const submission = await createSubmission(formData);
    return { success: true, submission };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      fields: Object.fromEntries(formData) // フォームデータを保持
    };
  }
}

// Client Component
"use client";
import { useActionState } from 'react';

function SubmissionForm() {
  const [state, submitAction, isPending] = useActionState(
    createSubmissionAction, 
    { success: null, error: null }
  );

  return (
    <form action={submitAction}>
      <input 
        type="text" 
        name="concept" 
        disabled={isPending}
        defaultValue={state.fields?.concept} 
      />
      {state.error && <div className="error">{state.error}</div>}
      <button disabled={isPending}>
        {isPending ? '送信中...' : '投稿する'}
      </button>
    </form>
  );
}
```

### C. useFormStatus による深いフォーム状態共有

```typescript
// ✅ デザインシステムコンポーネントでの活用
"use client";
import { useFormStatus } from 'react';

function SubmitButton({ children, variant = 'primary' }) {
  const { pending, data } = useFormStatus();
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`btn btn-${variant} ${pending ? 'btn-loading' : ''}`}
    >
      {pending ? 'Processing...' : children}
    </button>
  );
}

// FormLayoutコンポーネント内で使用
function FormLayout({ children }) {
  return (
    <form action={submitAction}>
      {children}
      <SubmitButton>送信</SubmitButton>
    </form>
  );
}
```

**影響度**: 🔥 高（UX大幅改善）
**実装難易度**: 🟡 中

---

## 3. パフォーマンス最適化

### 🎯 目標
レンダリング最適化、バンドルサイズ削減、Core Web Vitalsの改善

### A. React.memo とコンポーネントメモ化

```typescript
// ✅ EventCardコンポーネントの最適化
import { memo } from 'react';

const EventCard = memo(function EventCard({ 
  event, 
  isPast = false 
}: { 
  event: Event; 
  isPast?: boolean 
}) {
  return (
    <Card className={`h-full ${isPast ? 'opacity-80' : ''}`}>
      {/* カードコンテンツ */}
    </Card>
  );
}, (prevProps, nextProps) => {
  // カスタム比較関数でより細かい制御
  return (
    prevProps.event.id === nextProps.event.id &&
    prevProps.isPast === nextProps.isPast
  );
});
```

### B. useMemo による重い計算のメモ化

```typescript
// ✅ 日付計算とフィルタリングの最適化
function HomePage() {
  const events = useMemo(() => {
    const allEvents = Object.values(eventsConfig)
      .filter(event => event.active)
      .sort((a, b) => parseDeadline(b.deadline) - parseDeadline(a.deadline));
    
    const currentDate = getCurrentDate();
    
    return {
      active: allEvents.filter(event => isEventActive(event.deadline)),
      past: allEvents.filter(event => !isEventActive(event.deadline))
    };
  }, []); // eventsConfigが変更された場合のみ再計算

  return (
    // JSX
  );
}
```

### C. 動的インポートによるコード分割

```typescript
// ✅ 重いコンポーネントの遅延ロード
import { lazy, Suspense } from 'react';

const ContractCalculator = lazy(() => 
  import('@/components/organisms/ContractCalculator')
);

function EventPage({ eventId }) {
  const event = useEvent(eventId);
  
  return (
    <div>
      <EventInfo event={event} />
      
      {event.calculator && (
        <Suspense fallback={<CalculatorSkeleton />}>
          <ContractCalculator config={event.calculator} />
        </Suspense>
      )}
    </div>
  );
}
```

### D. 画像最適化の強化

```typescript
// ✅ Next.js Image コンポーネントの最適活用
import Image from 'next/image';

function EventThumbnail({ event }: { event: Event }) {
  return (
    <div className="relative aspect-video bg-gray-100">
      <Image
        src={event.thumbnailUrl}
        alt={event.title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        priority={event.active} // アクティブイベントは優先ロード
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,..." // ブラー画像
      />
    </div>
  );
}
```

**影響度**: 🔥 高（Core Web Vitals向上）
**実装難易度**: 🟢 低-中

---

## 4. データフェッチパターンの現代化

### 🎯 目標
Server Componentsによるサーバーサイドデータフェッチとクライアント-サーバー間の最適な役割分担

### A. Server Componentsでのデータフェッチ

**Before (現在):**
```typescript
// ❌ クライアントサイドでのデータフェッチ
"use client";
function VideoList({ eventId }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const allSubmissions = await getSubmissions();
      const eventSubmissions = allSubmissions.filter(/* ... */);
      setSubmissions(eventSubmissions);
      setLoading(false);
    };
    fetchSubmissions();
  }, [eventId]);

  if (loading) return <div>Loading...</div>;
  // ...
}
```

**After (提案):**
```typescript
// ✅ Server Componentでのデータフェッチ
async function VideoListServer({ eventId, eventTitle }) {
  // サーバーサイドで直接データを取得
  const submissions = await getSubmissionsByEventId(eventId);
  
  return (
    <div className="max-w-7xl mx-auto">
      <VideoListHeader eventTitle={eventTitle} count={submissions.length} />
      <VideoTable submissions={submissions} />
    </div>
  );
}

// インタラクティブな部分のみClient Component
"use client";
function VideoTable({ submissions }) {
  const [sortedSubmissions, setSortedSubmissions] = useState(submissions);
  
  const handleSort = useCallback((field, direction) => {
    setSortedSubmissions(prev => 
      [...prev].sort((a, b) => /* ソートロジック */)
    );
  }, []);

  return (
    <Table 
      dataSource={sortedSubmissions}
      onSort={handleSort}
      // ...
    />
  );
}
```

### B. Server Actionsの活用

```typescript
// ✅ Server Actions による直接的なサーバー操作
"use server";
export async function deleteSubmissionAction(formData: FormData) {
  const submissionId = formData.get('submissionId') as string;
  
  // 認証チェック
  const token = cookies().get('auth-token')?.value;
  await verifyAdminToken(token);
  
  // 直接Firebase操作
  await deleteSubmissionFromFirebase(submissionId);
  
  // UIの更新はrevalidatePathで
  revalidatePath('/admin');
  
  return { success: true };
}

// Client Component
"use client";
function DeleteButton({ submissionId }) {
  return (
    <form action={deleteSubmissionAction}>
      <input type="hidden" name="submissionId" value={submissionId} />
      <button type="submit" className="btn-danger">
        削除
      </button>
    </form>
  );
}
```

### C. Streaming とSuspenseの活用

```typescript
// ✅ データの優先度に応じたストリーミング
export default async function EventPage({ params }) {
  const { eventId } = await params;
  
  // 重要なデータは即座にロード
  const event = await getEvent(eventId);
  
  return (
    <div>
      {/* 即座に表示される基本情報 */}
      <EventHeader event={event} />
      
      {/* 段階的にロードされるコンテンツ */}
      <Suspense fallback={<SubmissionsSkeleton />}>
        <SubmissionsSection eventId={eventId} />
      </Suspense>
      
      <Suspense fallback={<StatsSkeleton />}>
        <EventStats eventId={eventId} />
      </Suspense>
    </div>
  );
}
```

**影響度**: 🔥 高（初期ロード大幅改善）
**実装難易度**: 🟡 中

---

## 5. コード重複排除と型安全性向上

### 🎯 目標
保守性の向上と開発者体験の改善

### A. ユーティリティ関数の統合

**Before (現在):**
```typescript
// ❌ 複数ファイルに散在する同じロジック
// src/app/page.tsx
function parseDeadline(deadline: string | null): number { /* ... */ }

// src/app/[eventId]/videos/page.tsx  
function parseDeadline(deadline: string | null): number { /* ... */ }
```

**After (提案):**
```typescript
// ✅ src/lib/utils/date.ts
export interface DateUtils {
  parseDeadline(deadline: string | null): number;
  getCurrentDate(): number;
  isEventActive(deadline: string | null): boolean;
  formatJapaneseDate(date: Date): string;
}

export const dateUtils: DateUtils = {
  parseDeadline(deadline) {
    if (!deadline) return 0;
    const match = deadline.match(/(\d+)\/(\d+)/);
    if (!match) return 0;
    const month = parseInt(match[1], 10);
    const day = parseInt(match[2], 10);
    return month * 100 + day;
  },

  getCurrentDate() {
    const now = new Date();
    return (now.getMonth() + 1) * 100 + now.getDate();
  },

  isEventActive(deadline) {
    if (!deadline) return false;
    return this.parseDeadline(deadline) >= this.getCurrentDate();
  },

  formatJapaneseDate(date) {
    return date.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short'
    });
  }
};

// 名前付きエクスポートで個別利用も可能
export const { parseDeadline, getCurrentDate, isEventActive, formatJapaneseDate } = dateUtils;
```

### B. 型定義の強化と統合

```typescript
// ✅ src/types/events.ts
export interface EventStage {
  value: string;
  label: string;
}

export interface EventCalculator {
  title: string;
  fiveStarOperatorImages: string[];
}

export interface EventConfig {
  id: string;
  title: string;
  deadline: string | null;
  thumbnailUrl: string;
  stages: EventStage[];
  defaultStage: string;
  active: boolean;
  calculator?: EventCalculator | null;
}

export interface ProcessedEvent extends EventConfig {
  path: string;
  hasDeadline: boolean;
  isActive: boolean;
  deadlineValue: number;
}

// ✅ src/types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}
```

### C. カスタムフックの活用

```typescript
// ✅ src/hooks/useEventData.ts
export function useEventData(eventId?: string) {
  return useMemo(() => {
    const allEvents = Object.values(eventsConfig as Record<string, EventConfig>);
    
    if (eventId) {
      const event = allEvents.find(e => e.id === eventId);
      if (!event) return null;
      
      return {
        ...event,
        path: `/${event.id}`,
        hasDeadline: Boolean(event.deadline),
        isActive: isEventActive(event.deadline),
        deadlineValue: parseDeadline(event.deadline)
      } as ProcessedEvent;
    }
    
    return allEvents
      .filter(event => event.active)
      .map(event => ({
        ...event,
        path: `/${event.id}`,
        hasDeadline: Boolean(event.deadline),
        isActive: isEventActive(event.deadline),
        deadlineValue: parseDeadline(event.deadline)
      }))
      .sort((a, b) => b.deadlineValue - a.deadlineValue);
  }, [eventId]);
}

// ✅ src/hooks/useSubmissions.ts
export function useSubmissions(eventId?: string) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSubmissions();
      
      const filtered = eventId 
        ? data.filter(sub => sub.stage.startsWith(eventId))
        : data;
        
      setSubmissions(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { submissions, loading, error, refetch };
}
```

**影響度**: 🟡 中（保守性大幅向上）
**実装難易度**: 🟢 低

---

## 6. Next.js 15 新機能の活用

### A. Turbopack の最適化

```typescript
// ✅ next.config.ts の強化
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack最適化
  experimental: {
    turbo: {
      rules: {
        '*.svg': ['@svgr/webpack'],
      },
    },
  },
  
  // 画像最適化
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // バンドル分析
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups.antd = {
        name: 'antd',
        test: /[\\/]node_modules[\\/]antd[\\/]/,
        chunks: 'all',
        priority: 20,
      };
    }
    return config;
  },
};
```

### B. Static Generation の強化

```typescript
// ✅ 静的生成の最適化
export async function generateStaticParams() {
  const events = Object.keys(eventsConfig);
  return events.map((eventId) => ({ eventId }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { eventId } = await params;
  const event = eventsConfig[eventId];
  
  if (!event) {
    return { title: 'Not Found' };
  }
  
  return {
    title: `${event.title} | アークナイツ攻略動画`,
    description: `${event.title}の攻略動画投稿企画`,
    openGraph: {
      title: event.title,
      description: `${event.title}の攻略動画投稿企画`,
      images: [event.thumbnailUrl],
    },
  };
}
```

**影響度**: 🟡 中（ビルド時間とSEO改善）
**実装難易度**: 🟢 低

---

## 実装ロードマップ

### Phase 1: 基盤整備 (1-2週間)
**優先度**: 🔥 最高
1. **ユーティリティ関数の統合**
   - `src/lib/utils/date.ts` の作成
   - 既存コードでの置き換え
   
2. **型定義の整理**
   - `src/types/` 以下の型定義強化
   - イベント関連型の統合

3. **カスタムフックの作成**
   - `useEventData`, `useSubmissions` の実装

### Phase 2: Server Components移行 (2-3週間)  
**優先度**: 🔥 最高
1. **ホームページのServer Component化**
   - `src/app/page.tsx` の書き換え
   - EventCard コンポーネントの分離

2. **動画リストページの最適化**
   - Server Component でのデータフェッチ
   - クライアント境界の最適化

### Phase 3: React 19新機能導入 (2-3週間)
**優先度**: 🟡 高
1. **Server Actions実装**
   - フォーム送信の Server Actions 化
   - 管理機能の Server Actions 化

2. **useOptimistic導入**
   - 投稿フォームでの楽観的更新
   - 削除操作での楽観的更新

### Phase 4: パフォーマンス最適化 (1-2週間)
**優先度**: 🟡 高
1. **メモ化の実装**
   - React.memo の適用
   - useMemo/useCallback の最適活用

2. **コード分割**
   - 重いコンポーネントの動的インポート
   - ルート別バンドル最適化

### Phase 5: 追加最適化 (継続的)
**優先度**: 🟢 中
1. **監視とメトリクス**
   - Core Web Vitals の監視
   - バンドル分析の定期実行

2. **継続的改善**
   - パフォーマンス指標の改善
   - 新機能の段階的導入

---

## 期待される効果

### パフォーマンス向上
- **初期ロード時間**: 30-50% 改善
- **JavaScriptバンドルサイズ**: 20-30% 削減  
- **Time to Interactive**: 40-60% 改善
- **Largest Contentful Paint**: 25-40% 改善

### 開発者体験向上
- **型安全性**: ランタイムエラー 70% 削減
- **コード重複**: 重複コード 80% 削減
- **保守性**: 機能追加時間 50% 短縮

### ユーザー体験向上
- **楽観的更新**: 操作フィードバック即座に表示
- **段階的ロード**: 重要コンテンツの優先表示
- **レスポンシブ性**: インタラクション応答性向上

---

## 補足資料

### 参考リンク
- [Next.js 15 App Router ドキュメント](https://nextjs.org/docs/app)
- [React 19 新機能ガイド](https://react.dev/blog/2024/04/25/react-19)
- [Server Components ベストプラクティス](https://react.dev/reference/rsc/server-components)

### 関連技術記事
- [React Server Components 実践ガイド](https://react.dev/reference/rsc/server-components)
- [Next.js パフォーマンス最適化](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React 19 Migration Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)

---

**作成日**: 2025年1月17日  
**更新日**: -  
**作成者**: Claude Code  
**レビュー**: 未実施