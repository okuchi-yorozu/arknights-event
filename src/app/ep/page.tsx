"use client";

import "@ant-design/v5-patch-for-react-19";
import { Typography } from "antd";

import { Thumbnails } from "@/components/molecules/Thumbnails";
import { VideoSubmissionForm } from "@/components/organisms";
import { EventSubmissionGuidelines } from "@/components/organisms/EventSubmissionGuidelines";
import { FormLayout } from "@/components/templates";

export default function EPSubmissionPage() {
	return (
		<FormLayout title="イベント『白海の彼方へ』攻略動画募集">
			<Typography.Title level={3} className="text-red-600 my-6">
				6/19（木）23時〆切
			</Typography.Title>
			<Thumbnails url="/ep-ex-8.jpg" />
			<EventSubmissionGuidelines />
			<VideoSubmissionForm
				stages={[{ value: "ep-ex-8", label: "EP-EX-8" }]}
				defaultStage="ep-ex-8"
			/>
		</FormLayout>
	);
}
