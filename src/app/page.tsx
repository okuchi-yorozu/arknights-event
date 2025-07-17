"use client";

import "@ant-design/v5-patch-for-react-19";

import { useEvents } from "@/hooks/useEventData";
import type { ProcessedEvent } from "@/types/events";
import { CalendarOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Tag, Typography } from "antd";
import Image from "next/image";
import Link from "next/link";

const { Title, Text } = Typography;

// イベントカードを表示するコンポーネント
function EventCard({
	event,
	isPast = false,
}: { event: ProcessedEvent; isPast?: boolean }) {
	return (
		<Card
			className={`h-full [&_.ant-card-body]:px-4 [&_.ant-card-body]:py-4 transition-shadow hover:shadow-lg cursor-default ${
				isPast ? "opacity-80" : ""
			}`}
			cover={
				<div className="relative aspect-video bg-gray-100">
					<Image
						src={event.thumbnailUrl}
						alt={event.title}
						fill
						className="object-cover"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
					/>
				</div>
			}
			actions={[
				<div key="apply" className="mx-4">
					<Link href={isPast ? `${event.path}/videos` : event.path}>
						<Button type={isPast ? "default" : "primary"} block>
							{isPast ? "動画一覧を見る" : "応募ページへ"}
						</Button>
					</Link>
				</div>,
			]}
		>
			<div className="space-y-2">
				<div className="text-base font-medium leading-relaxed line-clamp-2 min-h-[3rem]">
					{event.title}
				</div>
				<div className="min-h-[2rem] flex items-center">
					{event.hasDeadline && (
						<div className="flex items-center gap-1">
							<CalendarOutlined
								className={isPast ? "text-gray-400" : "text-red-500"}
							/>
							<Tag color={isPast ? "default" : "red"} className="text-sm">
								{event.deadline}
							</Tag>
						</div>
					)}
				</div>
			</div>
		</Card>
	);
}

export default function HomePage() {
	const { active: activeEvents, past: pastEvents } = useEvents();
	return (
		<main className="min-h-screen bg-gray-50">
			{/* 右上のユーザーアイコン */}
			<div className="fixed top-4 right-4 z-10">
				<Link href="/my-submissions">
					<Button
						type="primary"
						shape="circle"
						icon={<UserOutlined />}
						size="large"
						title="過去の投稿を編集する"
					/>
				</Link>
			</div>

			<div className="container mx-auto px-4 py-8">
				<div className="text-center mb-12">
					<Title level={1} className="!mb-4">
						アークナイツ攻略動画同時視聴企画
					</Title>
					<Text type="secondary" className="text-lg">
						イベントの投稿企画一覧
					</Text>
				</div>

				{/* 現在進行中のイベント */}
				{activeEvents.length > 0 && (
					<div className="mb-16">
						<div className="text-center mb-8">
							<Title level={2} className="!mb-2">
								🔥 現在進行中のイベント
							</Title>
							<Text type="secondary">現在応募可能なイベントです</Text>
						</div>
						<Row gutter={[24, 24]} justify="center">
							{activeEvents.map((event) => (
								<Col key={event.path} xs={24} sm={12} lg={8} xl={6}>
									<EventCard event={event} />
								</Col>
							))}
						</Row>
					</div>
				)}

				{/* 過去のイベント */}
				{pastEvents.length > 0 && (
					<div className="mb-16">
						<div className="text-center mb-8">
							<Title level={2} className="!mb-2">
								📚 過去のイベント
							</Title>
							<Text type="secondary">過去に募集したイベントの一覧です</Text>
						</div>
						<Row gutter={[24, 24]} justify="center">
							{pastEvents.map((event) => (
								<Col key={event.path} xs={24} sm={12} lg={8} xl={6}>
									<EventCard event={event} isPast={true} />
								</Col>
							))}
						</Row>
					</div>
				)}

				<div className="text-center mt-12">
					<Text type="secondary">
						各イベントの詳細は応募ページをご確認ください
					</Text>
				</div>
			</div>
		</main>
	);
}
