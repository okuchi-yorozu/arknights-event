"use client";

import "@ant-design/v5-patch-for-react-19";

import eventsConfig from "../../config/events.json";
import { CalendarOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Tag, Typography } from "antd";
import Image from "next/image";
import Link from "next/link";

const { Title, Text } = Typography;

interface Event {
	path: string;
	title: string;
	thumbnail: string;
	deadline: string | null;
	hasDeadline: boolean;
}

interface EventConfig {
	id: string;
	title: string;
	deadline: string | null;
	thumbnailUrl: string;
	stages: Array<{ value: string; label: string }>;
	defaultStage: string;
	active: boolean;
	calculator?: {
		title: string;
		fiveStarOperatorImages: string[];
	} | null;
}

// config/events.json から動的にイベントデータを生成
const events: Event[] = Object.values(
	eventsConfig as Record<string, EventConfig>,
)
	.filter((event) => event.active)
	.map((event) => ({
		path: `/${event.id}`,
		title: event.title,
		thumbnail: event.thumbnailUrl,
		deadline: event.deadline,
		hasDeadline: Boolean(event.deadline),
	}));

export default function HomePage() {
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
						過去に募集したイベントの一覧です
					</Text>
				</div>

				<Row gutter={[24, 24]} justify="center">
					{events.map((event) => (
						<Col key={event.path} xs={24} sm={12} lg={8} xl={6}>
							<Card
								className="h-full [&_.ant-card-body]:px-4 [&_.ant-card-body]:py-4 transition-shadow hover:shadow-lg cursor-default"
								cover={
									<div className="relative aspect-video bg-gray-100">
										<Image
											src={event.thumbnail}
											alt={event.title}
											fill
											className="object-cover"
											sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
										/>
									</div>
								}
								actions={[
									<div key="apply" className="mx-4">
										<Link href={event.path}>
											<Button type="primary" block>
												応募ページへ
											</Button>
										</Link>
									</div>,
								]}
							>
								<div className="space-y-2">
									<div className="text-base font-medium leading-relaxed whitespace-normal break-words">
										{event.title}
									</div>
									<div className="min-h-[2rem] flex items-center">
										{event.hasDeadline && (
											<div className="flex items-center gap-1">
												<CalendarOutlined className="text-red-500" />
												<Tag color="red" className="text-sm">
													{event.deadline}
												</Tag>
											</div>
										)}
									</div>
								</div>
							</Card>
						</Col>
					))}
				</Row>

				<div className="text-center mt-12">
					<Text type="secondary">
						各イベントの詳細は応募ページをご確認ください
					</Text>
				</div>
			</div>
		</main>
	);
}
