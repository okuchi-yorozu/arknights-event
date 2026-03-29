"use client";

import "@ant-design/v5-patch-for-react-19";

import { useEffect, useState } from "react";

import { DeleteOutlined, EditOutlined, HomeOutlined } from "@ant-design/icons";
import {
	Button,
	Card,
	Empty,
	Form,
	Modal,
	Popconfirm,
	Space,
	Tag,
	Typography,
	message,
} from "antd";

import { FormButton } from "@/components/atoms";
import {
	ConceptField,
	DoctorHistoryField,
	EditingField,
	IntroductionField,
	TwitterField,
	YoutubeUrlField,
} from "@/components/molecules";
import { useAuth } from "@/lib/firebase/auth-context";
import type { Submission } from "@/types/submission";
import Link from "next/link";

const { Title, Text } = Typography;

export default function MySubmissionsPage() {
	const [messageApi, contextHolder] = message.useMessage();
	const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
	const [loading, setLoading] = useState(true);
	const [editingSubmission, setEditingSubmission] = useState<Submission | null>(
		null,
	);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [saving, setSaving] = useState(false);
	const { user, getIdToken } = useAuth();

	useEffect(() => {
		if (!user) return;

		const loadMySubmissions = async () => {
			try {
				const idToken = await getIdToken();
				const response = await fetch("/api/my-submissions", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ idToken }),
				});

				if (response.ok) {
					const submissions = await response.json();
					setMySubmissions(
						submissions.map((s: Submission) => ({
							...s,
							createdAt: new Date(s.createdAt),
						})),
					);
				}
			} catch (error) {
				console.error("Error loading my submissions:", error);
				messageApi.error("投稿データの読み込みに失敗しました");
			} finally {
				setLoading(false);
			}
		};

		loadMySubmissions();
	}, [user, getIdToken, messageApi]);

	const isExpired = (createdAt: Date) => {
		const daysDiff =
			(Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
		return daysDiff > 30;
	};

	const handleDelete = async (id: string) => {
		try {
			const idToken = await getIdToken();
			const response = await fetch(`/api/submissions/${id}`, {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ idToken }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete submission");
			}

			messageApi.success("投稿を削除しました");
			setMySubmissions((prev) => prev.filter((s) => s.id !== id));
		} catch (error) {
			console.error("Error deleting submission:", error);
			messageApi.error("削除に失敗しました。もう一度お試しください。");
		}
	};

	const handleEdit = (submission: Submission) => {
		if (isExpired(submission.createdAt)) {
			messageApi.error("編集期限（30日）を過ぎているため、編集できません");
			return;
		}
		setEditingSubmission(submission);
		setEditModalOpen(true);
	};

	const handleSave = async (
		values: Omit<Submission, "id" | "uid" | "createdAt">,
	) => {
		if (!editingSubmission) return;

		setSaving(true);
		try {
			const idToken = await getIdToken();
			const response = await fetch(`/api/submissions/${editingSubmission.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ ...values, idToken }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to update submission");
			}

			messageApi.success("投稿情報を更新しました！");
			setEditModalOpen(false);
			setEditingSubmission(null);

			// 一覧を再取得
			const idTokenRefresh = await getIdToken();
			const refreshed = await fetch("/api/my-submissions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ idToken: idTokenRefresh }),
			});
			if (refreshed.ok) {
				const submissions = await refreshed.json();
				setMySubmissions(
					submissions.map((s: Submission) => ({
						...s,
						createdAt: new Date(s.createdAt),
					})),
				);
			}
		} catch (error) {
			console.error("Error updating submission:", error);
			messageApi.error(
				error instanceof Error
					? error.message
					: "更新に失敗しました。もう一度お試しください。",
			);
		} finally {
			setSaving(false);
		}
	};

	const getEventInfo = (stage: string) => {
		if (stage?.startsWith("ep-")) {
			return { name: "白き海の彼方へ", color: "cyan" };
		}
		if (stage?.startsWith("pv-")) {
			return { name: "幕開く者たち", color: "purple" };
		}
		if (stage?.startsWith("go-")) {
			return { name: "落日の向こうへ", color: "volcano" };
		}
		if (stage?.startsWith("at-ex")) {
			return { name: "墟 EX", color: "volcano" };
		}
		if (stage?.startsWith("at-s")) {
			return { name: "墟 S", color: "volcano" };
		}
		if (stage?.startsWith("as-")) {
			return { name: "アークナイツ攻略動画企画", color: "lime" };
		}
		return { name: "不明", color: "default" };
	};

	if (loading) {
		return (
			<main className="min-h-screen p-8">
				<div className="max-w-4xl mx-auto">
					<div className="text-center">読み込み中...</div>
				</div>
			</main>
		);
	}

	return (
		<>
			{contextHolder}
			{/* 右上のホームアイコン */}
			<div className="fixed top-4 right-4 z-10">
				<Link href="/">
					<Button
						type="primary"
						shape="circle"
						icon={<HomeOutlined />}
						size="large"
						title="ホームに戻る"
					/>
				</Link>
			</div>

			<main className="min-h-screen p-8">
				<div className="max-w-4xl mx-auto">
					<div className="mb-8">
						<Title level={2} className="!mb-0">
							過去の自分の投稿
						</Title>
					</div>

					{mySubmissions.length === 0 ? (
						<Empty
							description="まだ投稿がありません"
							image={Empty.PRESENTED_IMAGE_SIMPLE}
						/>
					) : (
						<Space direction="vertical" size="large" className="w-full">
							{mySubmissions.map((submission) => (
								<Card
									key={submission.id}
									title={
										<div className="flex justify-between items-center">
											<Text strong>{submission.concept}</Text>
											<div className="flex gap-2">
												{submission.stage && (
													<Tag color={getEventInfo(submission.stage).color}>
														{getEventInfo(submission.stage).name}
													</Tag>
												)}
												{isExpired(submission.createdAt) ? (
													<Tag color="magenta">編集期限切れ</Tag>
												) : (
													<Tag color="green">編集可能</Tag>
												)}
												<Tag color="geekblue">
													{new Date(submission.createdAt).toLocaleDateString()}
												</Tag>
											</div>
										</div>
									}
									extra={
										<Space>
											<Button
												type="primary"
												icon={<EditOutlined />}
												onClick={() => handleEdit(submission)}
												disabled={isExpired(submission.createdAt)}
												style={{ height: "40px" }}
											>
												編集
											</Button>
											<Popconfirm
												title="投稿を削除しますか？"
												description="この操作は取り消せません。"
												okText="削除"
												cancelText="キャンセル"
												okButtonProps={{ danger: true }}
												onConfirm={() => handleDelete(submission.id ?? "")}
											>
												<Button
													danger
													icon={<DeleteOutlined />}
													style={{ height: "40px" }}
												>
													削除
												</Button>
											</Popconfirm>
										</Space>
									}
								>
									{submission.introduction && (
										<Text type="secondary" className="text-sm">
											{submission.introduction}
										</Text>
									)}
								</Card>
							))}
						</Space>
					)}
				</div>

				<Modal
					title="投稿情報の編集"
					open={editModalOpen}
					onCancel={() => setEditModalOpen(false)}
					footer={null}
					width={800}
					destroyOnClose
				>
					{editingSubmission && (
						<Form
							layout="vertical"
							onFinish={handleSave}
							size="large"
							requiredMark
							initialValues={editingSubmission}
						>
							<YoutubeUrlField />
							<ConceptField />
							<EditingField />
							<TwitterField />
							<DoctorHistoryField />
							<IntroductionField />

							<div className="flex justify-end gap-2 mt-6">
								<Button
									onClick={() => setEditModalOpen(false)}
									style={{ height: "40px" }}
								>
									キャンセル
								</Button>
								<FormButton
									type="primary"
									htmlType="submit"
									loading={saving}
									style={{ height: "40px" }}
								>
									{saving ? "保存中..." : "保存"}
								</FormButton>
							</div>
						</Form>
					)}
				</Modal>
			</main>
		</>
	);
}
