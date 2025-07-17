"use client";

import "@ant-design/v5-patch-for-react-19";
import { UserOutlined } from "@ant-design/icons";
import { Button, Typography } from "antd";
import Link from "next/link";

import { Thumbnails } from "@/components/molecules/Thumbnails";
import { VideoSubmissionForm } from "@/components/organisms";
import { EventSubmissionGuidelines } from "@/components/organisms/EventSubmissionGuidelines";
import { FormLayout } from "@/components/templates";

interface EventConfig {
	id: string;
	title: string;
	deadline: string | null;
	thumbnailUrl: string;
	stages: Array<{ value: string; label: string }>;
	defaultStage: string;
	active: boolean;
}

interface ClientEventPageProps {
	eventConfig: EventConfig;
}

export function ClientEventPage({ eventConfig }: ClientEventPageProps) {
	return (
		<>
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

			<FormLayout title={eventConfig.title}>
				{eventConfig.deadline && (
					<Typography.Title level={3} className="text-red-600 my-6">
						{eventConfig.deadline}
					</Typography.Title>
				)}
				<Thumbnails url={eventConfig.thumbnailUrl} />
				<EventSubmissionGuidelines />
				<VideoSubmissionForm
					stages={eventConfig.stages}
					defaultStage={eventConfig.defaultStage}
				/>
			</FormLayout>
		</>
	);
}
