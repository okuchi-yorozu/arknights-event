"use client";

import "@ant-design/v5-patch-for-react-19";
import { UserOutlined } from "@ant-design/icons";
import { Button, Typography } from "antd";
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

			<FormLayout title="イベント『幕開く者たち』攻略動画募集">
				<Typography.Title level={3} className="text-red-600 my-6">
					5/15（木）23時〆切
				</Typography.Title>
				<Thumbnails url="/pv-ex-8.jpg" />
				<EventSubmissionGuidelines />
				<VideoSubmissionForm
					stages={[
						{ value: "pv-ex-8", label: "PV-EX-8" },
						{ value: "pv-s-5", label: "PV-S-5" },
					]}
					defaultStage="pv-ex-8"
				/>
			</FormLayout>
		</>
	);
}
