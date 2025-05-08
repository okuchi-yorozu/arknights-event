"use client";

import "@ant-design/v5-patch-for-react-19";

import { Thumbnails } from "@/components/molecules/Thumbnails";
import { VideoSubmissionForm } from "@/components/organisms";
import { EventSubmissionGuidelines } from "@/components/organisms/EventSubmissionGuidelines";
import { FormLayout } from "@/components/templates";

export default function GOSubmissionPage() {
	return (
		<FormLayout title="イベント『幕開く者たち』攻略動画募集">
			<Thumbnails url="/pv-ex-8.jpg" />
			<EventSubmissionGuidelines />
			<VideoSubmissionForm
				stages={[{ value: "pv-ex-8", label: "PV-EX-8" }, { value: "pv-s-5", label: "PV-S-5" }]}
				defaultStage="pv-ex-8"
			/>
		</FormLayout>
	);
}
