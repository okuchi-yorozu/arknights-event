"use client";

import "@ant-design/v5-patch-for-react-19";
import { UserOutlined } from "@ant-design/icons";
import { Button } from "antd";
import Link from "next/link";

import { Thumbnails } from "@/components/molecules/Thumbnails";
import { VideoSubmissionForm } from "@/components/organisms";
import { EventSubmissionGuidelines } from "@/components/organisms/EventSubmissionGuidelines";
import { FormLayout } from "@/components/templates";

export default function GOSubmissionPage() {
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

			<FormLayout title="イベント『落日の向こうへ』攻略動画募集">
				<Thumbnails url="/go-ex-8.jpg" />
				<EventSubmissionGuidelines />
				<VideoSubmissionForm
					stages={[{ value: "go-ex-8", label: "GO-EX-8" }]}
					defaultStage="go-ex-8"
				/>
			</FormLayout>
		</>
	);
}
