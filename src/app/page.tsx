import { UserNavigation } from "@/components/molecules/UserNavigation";
import {
	ActiveEventsSection,
	PastEventsSection,
} from "@/components/organisms/AsyncEventSection";
import { EventSectionSkeleton } from "@/components/organisms/EventSkeleton";
import { Typography } from "antd";
import { Suspense } from "react";

const { Title, Text } = Typography;

/**
 * ホームページ - Server Component with Streaming
 * 段階的にコンテンツをストリーミングして表示
 */
export default function HomePage() {
	return (
		<main className="min-h-screen bg-gray-50">
			{/* ユーザーナビゲーション - Client Component */}
			<UserNavigation />

			<div className="container mx-auto px-4 py-8">
				{/* ページヘッダー - 即座に表示 */}
				<div className="text-center mb-12">
					<Title level={1} className="!mb-4">
						アークナイツ攻略動画同時視聴企画
					</Title>
					<Text type="secondary" className="text-lg">
						イベントの投稿企画一覧
					</Text>
				</div>

				{/* 現在進行中のイベント - 段階的ロード */}
				<Suspense fallback={<EventSectionSkeleton />}>
					<ActiveEventsSection />
				</Suspense>

				{/* 過去のイベント - 段階的ロード */}
				<Suspense fallback={<EventSectionSkeleton />}>
					<PastEventsSection />
				</Suspense>

				{/* フッター - 即座に表示 */}
				<div className="text-center mt-12">
					<Text type="secondary">
						各イベントの詳細は応募ページをご確認ください
					</Text>
				</div>
			</div>
		</main>
	);
}
