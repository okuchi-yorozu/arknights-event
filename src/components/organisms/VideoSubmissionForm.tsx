"use client";

import { createSubmissionAction } from "@/lib/actions/submissions";
import type { Submission } from "@/types/submission";
import type { SubmissionFormState } from "@/lib/actions/submissions";

import { useActionState, useEffect } from "react";

import { Button, Descriptions, Form, Modal, Tag, message } from "antd";
import Link from "next/link";

import { FormButton } from "../atoms";
import {
	ConceptField,
	DoctorHistoryField,
	EditingField,
	IntroductionField,
	StageFields,
	TwitterField,
	YoutubeUrlField,
} from "../molecules";

type FormData = Omit<Submission, "id" | "createdAt" | "editKey">;

interface VideoSubmissionFormProps {
	stages: Array<{ value: string; label: string }>;
	defaultStage: string;
}

export const VideoSubmissionForm = ({
	stages,
	defaultStage,
}: VideoSubmissionFormProps) => {
	const [form] = Form.useForm<FormData>();
	const [messageApi, contextHolder] = message.useMessage();
	
	// React 19のuseActionStateを使用してフォーム状態管理を統合
	const [state, submitAction, isPending] = useActionState(
		createSubmissionAction,
		{ success: false }
	);

	// useActionStateの結果に応じてUIフィードバックを表示
	useEffect(() => {
		if (state.success && state.submission) {
			// localStorageに編集キーと投稿IDを保存
			const savedSubmissions = JSON.parse(
				localStorage.getItem("mySubmissions") || "[]",
			);
			savedSubmissions.push({
				id: state.submission.id,
				editKey: state.submission.editKey,
				createdAt: new Date().toISOString(),
				concept: state.submission.concept,
			});
			localStorage.setItem("mySubmissions", JSON.stringify(savedSubmissions));

			messageApi.success(
				<div>
					<div className="mb-2">応募が完了しました!</div>
					<Link href="/my-submissions">
						<Button type="link" size="small" className="p-0">
							過去の投稿を編集する →
						</Button>
					</Link>
				</div>,
				5, // 5秒間表示
			);
			form.resetFields();
		} else if (state.error) {
			messageApi.error(state.error);
		}
	}, [state, messageApi, form]);

	// Server Actionを使用したフォーム送信
	const handleSubmit = async (values: FormData) => {
		submitAction(values);
	};

	const getDoctorHistoryText = (value: string) => {
		const mapping: Record<string, string> = {
			"less-than-6months": "6ヶ月未満",
			"6months-1year": "6ヶ月〜1年",
			"1-2years": "1年〜2年",
			"2-3years": "2年〜3年",
			"more-than-3years": "3年以上",
		};
		return mapping[value] || value;
	};

	return (
		<>
			{contextHolder}
			<Form
				form={form}
				layout="vertical"
				onFinish={handleSubmit}
				size="large"
				requiredMark
				initialValues={{
					hasEditing: "raw",
					stage: defaultStage,
					difficulty: "normal",
				}}
			>
				<YoutubeUrlField />
				<ConceptField />
				<EditingField />
				<StageFields stages={stages} />
				<TwitterField />
				<DoctorHistoryField />
				<IntroductionField />

				<Form.Item className="mb-0">
					<FormButton
						type="primary"
						htmlType="submit"
						loading={isPending}
						block
					>
						{isPending ? "送信中..." : "応募する"}
					</FormButton>
				</Form.Item>
			</Form>

			{/* React 19のuseActionStateを使用したため、確認モーダルは不要になり、直接送信する */}
		</>
	);
};
