"use client";

import "@ant-design/v5-patch-for-react-19";
import { UserOutlined } from "@ant-design/icons";
import { Button } from "antd";
import Link from "next/link";

import { Thumbnails } from "@/components/molecules/Thumbnails";
import { VideoSubmissionForm } from "@/components/organisms";
import { EventSubmissionGuidelines } from "@/components/organisms/EventSubmissionGuidelines";
import { FormLayout } from "@/components/templates";

export default function Home() {
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

			<FormLayout title="アークナイツ攻略動画企画応募フォーム">
				<Thumbnails />
				<EventSubmissionGuidelines />
				<VideoSubmissionForm
					stages={[
						{ value: "as-ex-8", label: "AS-EX-8" },
						{ value: "as-s-4", label: "AS-S-4" },
					]}
					defaultStage="as-ex-8"
				/>
			</FormLayout>
		</>
	);
}
