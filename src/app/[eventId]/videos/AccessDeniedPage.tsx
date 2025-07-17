"use client";

import { LockOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Typography, Card } from "antd";
import Link from "next/link";

const { Title, Paragraph } = Typography;

interface AccessDeniedPageProps {
	eventTitle: string;
}

export function AccessDeniedPage({ eventTitle }: AccessDeniedPageProps) {
	return (
		<div className="max-w-2xl mx-auto text-center">
			<div className="flex items-center justify-start mb-8">
				<Link href="/">
					<Button
						type="text"
						icon={<ArrowLeftOutlined />}
						size="large"
						className="hover:bg-gray-100"
					>
						トップページへ戻る
					</Button>
				</Link>
			</div>

			<Card className="p-8 shadow-lg">
				<div className="text-center">
					<div className="text-6xl text-gray-400 mb-4">
						<LockOutlined />
					</div>

					<Title level={2} className="!mb-4">
						アクセス制限
					</Title>

					<Paragraph className="text-lg text-gray-600 mb-6">
						<strong>{eventTitle}</strong>
						は現在進行中のイベントのため、投稿動画一覧を公開していません。
					</Paragraph>

					<div className="bg-blue-50 p-4 rounded-lg mb-6">
						<Paragraph className="text-blue-800 mb-2">
							<strong>動画一覧の公開について</strong>
						</Paragraph>
						<Paragraph className="text-blue-700 mb-0">
							イベントが終了した後に、投稿された動画の一覧を公開いたします。
						</Paragraph>
					</div>

					<div className="space-y-4">
						<Link href="/">
							<Button type="primary" size="large">
								トップページへ戻る
							</Button>
						</Link>
					</div>
				</div>
			</Card>
		</div>
	);
}
