"use client";

import "@ant-design/v5-patch-for-react-19";

import { uploadEventThumbnail } from "@/lib/firebase/storageUpload";
import type { EventConfig, EventStage } from "@/types/events";
import {
	DeleteOutlined,
	EditOutlined,
	MinusCircleOutlined,
	PlusOutlined,
	UploadOutlined,
} from "@ant-design/icons";
import {
	App,
	Button,
	Form,
	Input,
	Modal,
	Select,
	Space,
	Switch,
	Table,
	Tag,
	Typography,
	Upload,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UploadFile } from "antd/es/upload";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const { Title } = Typography;

type EventSource = "firestore" | "static";

interface EventRow extends EventConfig {
	source: EventSource;
}

interface EventFormValues {
	id: string;
	title: string;
	deadline?: string;
	thumbnailUrl?: string;
	stages: EventStage[];
	defaultStage: string;
	active: boolean;
}

export default function AdminEventsPage() {
	const { message, modal } = App.useApp();
	const [events, setEvents] = useState<EventRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [editingEvent, setEditingEvent] = useState<EventRow | null>(null);
	const [form] = Form.useForm<EventFormValues>();
	const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [uploading, setUploading] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	// eventsをFirestoreと静的設定に分けて読み込む
	const fetchEvents = useCallback(async () => {
		setLoading(true);
		try {
			// 全イベントとFirestoreのIDを並行して取得
			const [eventsRes, firestoreIdsRes] = await Promise.all([
				fetch("/api/admin/events"),
				fetch("/api/admin/events?source=firestore-ids"),
			]);

			if (!eventsRes.ok) {
				throw new Error("イベント一覧の取得に失敗しました");
			}

			const data: EventConfig[] = await eventsRes.json();

			let firestoreIds = new Set<string>();
			if (firestoreIdsRes.ok) {
				const ids: string[] = await firestoreIdsRes.json();
				firestoreIds = new Set(ids);
			}

			// sourceを判定してEventRowに変換
			const eventRows: EventRow[] = data.map((event) => ({
				...event,
				source: firestoreIds.has(event.id) ? "firestore" : "static",
			}));

			setEvents(eventRows);
		} catch (error) {
			message.error(
				error instanceof Error ? error.message : "イベントの読み込みに失敗しました",
			);
		} finally {
			setLoading(false);
		}
	}, [message]);

	useEffect(() => {
		fetchEvents();
	}, [fetchEvents]);

	const openCreateModal = () => {
		setEditingEvent(null);
		setThumbnailUrl("");
		setFileList([]);
		form.resetFields();
		form.setFieldsValue({
			active: true,
			stages: [{ value: "", label: "" }],
		});
		setModalOpen(true);
	};

	const openEditModal = (event: EventRow) => {
		setEditingEvent(event);
		setThumbnailUrl(event.thumbnailUrl);
		setFileList([]);
		form.setFieldsValue({
			id: event.id,
			title: event.title,
			deadline: event.deadline ?? undefined,
			thumbnailUrl: event.thumbnailUrl,
			stages: event.stages,
			defaultStage: event.defaultStage,
			active: event.active,
		});
		setModalOpen(true);
	};

	const handleDelete = async (event: EventRow) => {
		const confirmed = await modal.confirm({
			title: "イベントの削除",
			content: `「${event.title}」を削除してもよろしいですか？`,
			okText: "削除",
			okType: "danger",
			cancelText: "キャンセル",
		});

		if (!confirmed) return;

		try {
			const res = await fetch(`/api/admin/events/${event.id}`, {
				method: "DELETE",
			});
			if (!res.ok) {
				throw new Error("削除に失敗しました");
			}
			message.success("イベントを削除しました");
			fetchEvents();
		} catch (error) {
			message.error(
				error instanceof Error ? error.message : "削除に失敗しました",
			);
		}
	};

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();
			setSubmitting(true);

			const payload: EventConfig = {
				id: values.id,
				title: values.title,
				deadline: values.deadline ?? null,
				thumbnailUrl: thumbnailUrl,
				stages: values.stages,
				defaultStage: values.defaultStage,
				active: values.active,
				calculator: editingEvent?.calculator ?? null,
			};

			if (editingEvent) {
				// 更新
				const res = await fetch(`/api/admin/events/${editingEvent.id}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});
				if (!res.ok) {
					throw new Error("更新に失敗しました");
				}
				message.success("イベントを更新しました");
			} else {
				// 新規作成
				const res = await fetch("/api/admin/events", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});
				if (!res.ok) {
					const body = await res.json();
					throw new Error(body.error ?? "作成に失敗しました");
				}
				message.success("イベントを作成しました");
			}

			setModalOpen(false);
			fetchEvents();
		} catch (error) {
			if (error instanceof Error) {
				message.error(error.message);
			}
		} finally {
			setSubmitting(false);
		}
	};

	const columns: ColumnsType<EventRow> = [
		{
			title: "ID",
			dataIndex: "id",
			key: "id",
			width: 120,
			render: (id: string) => <code>{id}</code>,
		},
		{
			title: "タイトル",
			dataIndex: "title",
			key: "title",
		},
		{
			title: "締切",
			dataIndex: "deadline",
			key: "deadline",
			width: 200,
			render: (deadline: string | null) => deadline ?? "-",
		},
		{
			title: "ソース",
			dataIndex: "source",
			key: "source",
			width: 120,
			render: (source: EventSource) =>
				source === "firestore" ? (
					<Tag color="blue">Firestore</Tag>
				) : (
					<Tag color="default">静的設定</Tag>
				),
		},
		{
			title: "公開状態",
			dataIndex: "active",
			key: "active",
			width: 100,
			render: (active: boolean) =>
				active ? <Tag color="green">公開</Tag> : <Tag color="red">非公開</Tag>,
		},
		{
			title: "操作",
			key: "action",
			width: 160,
			render: (_: unknown, record: EventRow) => {
				if (record.source === "static") {
					return <Tag color="default">読み取り専用</Tag>;
				}
				return (
					<Space>
						<Button
							type="text"
							icon={<EditOutlined />}
							onClick={() => openEditModal(record)}
						>
							編集
						</Button>
						<Button
							type="text"
							danger
							icon={<DeleteOutlined />}
							onClick={() => handleDelete(record)}
						>
							削除
						</Button>
					</Space>
				);
			},
		},
	];

	// stages フィールドの変更を監視してdefaultStageのSelectを更新
	const stages: EventStage[] = Form.useWatch("stages", form) ?? [];
	const stageOptions = stages
		.filter((s) => s?.value)
		.map((s) => ({ value: s.value, label: s.label || s.value }));

	return (
		<main className="min-h-screen p-8">
			<div className="max-w-5xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<Title level={2} className="!mb-0">
						イベント管理
					</Title>
					<Button
						type="primary"
						icon={<PlusOutlined />}
						onClick={openCreateModal}
					>
						新規イベント作成
					</Button>
				</div>

				<Table
					columns={columns}
					dataSource={events}
					rowKey="id"
					loading={loading}
					pagination={false}
				/>

				<Modal
					title={editingEvent ? "イベントを編集" : "新規イベント作成"}
					open={modalOpen}
					onCancel={() => setModalOpen(false)}
					onOk={handleSubmit}
					okText={editingEvent ? "更新" : "作成"}
					cancelText="キャンセル"
					confirmLoading={submitting}
					width={640}
				>
					<Form
						form={form}
						layout="vertical"
						className="mt-4"
					>
						<Form.Item
							label="ID"
							name="id"
							rules={[
								{ required: true, message: "IDを入力してください" },
								{
									pattern: /^[a-z0-9-]+$/,
									message: "英小文字・数字・ハイフンのみ使用できます",
								},
							]}
						>
							<Input
								placeholder="例: at-ex"
								disabled={!!editingEvent}
							/>
						</Form.Item>

						<Form.Item
							label="タイトル"
							name="title"
							rules={[{ required: true, message: "タイトルを入力してください" }]}
						>
							<Input placeholder="例: イベント『墟』EX攻略動画募集" />
						</Form.Item>

						<Form.Item
							label="締切テキスト（任意）"
							name="deadline"
						>
							<Input placeholder="例: 5/15（木）23時〆切" />
						</Form.Item>

						<Form.Item label="サムネイル画像">
							{thumbnailUrl && (
								<div className="mb-2 relative w-40 h-24">
									<Image
										src={thumbnailUrl}
										alt="サムネイルプレビュー"
										fill
										className="object-cover rounded"
									/>
								</div>
							)}
							<Upload
								fileList={fileList}
								customRequest={async ({ file, onSuccess, onError }) => {
									setUploading(true);
									try {
										const url = await uploadEventThumbnail(file as File);
										setThumbnailUrl(url);
										onSuccess?.(url);
										message.success("画像をアップロードしました");
									} catch (err) {
										onError?.(err as Error);
										message.error("画像のアップロードに失敗しました");
									} finally {
										setUploading(false);
									}
								}}
								onChange={({ fileList: newList }) => setFileList(newList)}
								accept="image/*"
								maxCount={1}
								showUploadList={false}
							>
								<Button icon={<UploadOutlined />} loading={uploading}>
									画像を選択してアップロード
								</Button>
							</Upload>
						</Form.Item>

						<Form.Item label="ステージ">
							<Form.List
								name="stages"
								rules={[
									{
										validator: async (_, stageList) => {
											if (!stageList || stageList.length === 0) {
												return Promise.reject(
													new Error("ステージは1つ以上必要です"),
												);
											}
										},
									},
								]}
							>
								{(fields, { add, remove }, { errors }) => (
									<>
										{fields.map(({ key, name }) => (
											<Space key={key} className="flex mb-2" align="baseline">
												<Form.Item
													name={[name, "value"]}
													rules={[
														{ required: true, message: "値を入力してください" },
													]}
													noStyle
												>
													<Input placeholder="値 (例: at-ex-8)" />
												</Form.Item>
												<Form.Item
													name={[name, "label"]}
													rules={[
														{
															required: true,
															message: "ラベルを入力してください",
														},
													]}
													noStyle
												>
													<Input placeholder="ラベル (例: AT-EX-8)" />
												</Form.Item>
												{fields.length > 1 && (
													<MinusCircleOutlined
														onClick={() => remove(name)}
														className="text-red-500 cursor-pointer"
													/>
												)}
											</Space>
										))}
										<Form.ErrorList errors={errors} />
										<Button
											type="dashed"
											onClick={() => add({ value: "", label: "" })}
											icon={<PlusOutlined />}
											className="mt-2"
										>
											ステージを追加
										</Button>
									</>
								)}
							</Form.List>
						</Form.Item>

						<Form.Item
							label="デフォルトステージ"
							name="defaultStage"
							rules={[
								{ required: true, message: "デフォルトステージを選択してください" },
							]}
						>
							<Select
								placeholder="デフォルトステージを選択"
								options={stageOptions}
							/>
						</Form.Item>

						<Form.Item
							label="公開状態"
							name="active"
							valuePropName="checked"
						>
							<Switch checkedChildren="公開" unCheckedChildren="非公開" />
						</Form.Item>
					</Form>
				</Modal>
			</div>
		</main>
	);
}
