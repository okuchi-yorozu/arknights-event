"use client";

import { useSubmissions } from "@/hooks/useSubmissions";
import type { Submission } from "@/types/submission";
import { ArrowLeftOutlined, YoutubeOutlined } from "@ant-design/icons";
import "@ant-design/v5-patch-for-react-19";

import Link from "next/link";

import { Button, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

import { getTwitterIconUrl } from "@/utils/twitter";

const { Title } = Typography;

interface VideoListProps {
	eventId: string;
	eventTitle: string;
}

export function VideoList({ eventId, eventTitle }: VideoListProps) {
	const { submissions, loading, error } = useSubmissions(eventId);

	// エラーハンドリング
	if (error) {
		return (
			<div className="max-w-7xl mx-auto">
				<div className="text-center py-8">
					<div className="text-red-500 mb-4">エラーが発生しました</div>
					<div className="text-gray-600">{error}</div>
				</div>
			</div>
		);
	}

	const columns: ColumnsType<Submission> = [
		{
			title: "No",
			key: "index",
			width: 60,
			render: (_text, _record, index) => index + 1,
		},
		{
			title: "X",
			dataIndex: "twitterHandle",
			key: "twitterHandle",
			render: (handle: string | undefined) =>
				handle ? (
					<a
						href={`https://twitter.com/${handle.replace("@", "")}`}
						target="_blank"
						rel="noopener noreferrer"
						className="hover:opacity-80"
					>
						<Space direction="vertical" align="center">
							<img
								src={getTwitterIconUrl(handle)}
								alt={`${handle}のTwitterアイコン`}
								className="w-12 h-12 rounded-full"
							/>
							<span className="text-sm">{handle}</span>
						</Space>
					</a>
				) : (
					"-"
				),
			width: 120,
		},
		{
			title: "ドクター歴",
			dataIndex: "doctorHistory",
			key: "doctorHistory",
			render: (value: string) => {
				const mapping: Record<string, string> = {
					"less-than-6months": "6ヶ月未満",
					"6months-1year": "6ヶ月〜1年",
					"1-2years": "1年〜2年",
					"2-3years": "2年〜3年",
					"more-than-3years": "3年以上",
				};
				return mapping[value] || value;
			},
			width: 120,
		},
		{
			title: "ステージ",
			dataIndex: "stage",
			key: "stage",
			filters:
				submissions.length > 0
					? Array.from(new Set(submissions.map((s) => s.stage))).map(
							(stage) => ({
								text: stage,
								value: stage,
							}),
						)
					: [],
			onFilter: (value, record) => record.stage === value,
			filterSearch: true,
			width: 100,
		},
		{
			title: "難易度",
			dataIndex: "difficulty",
			key: "difficulty",
			render: (value: string) => (
				<Tag color={value === "normal" ? "blue" : "red"}>
					{value === "normal" ? "通常" : "強襲作戦"}
				</Tag>
			),
			width: 100,
		},
		{
			title: "コンセプト",
			dataIndex: "concept",
			key: "concept",
			render: (text: string) => (
				<div className="max-h-32 overflow-y-auto whitespace-pre-wrap">
					{text}
				</div>
			),
			width: 300,
		},
		{
			title: "編集",
			dataIndex: "hasEditing",
			key: "hasEditing",
			render: (value: string) => (value === "edited" ? "編集あり" : "編集なし"),
			width: 100,
		},
		{
			title: "YouTube",
			dataIndex: "youtubeUrl",
			key: "youtubeUrl",
			render: (url: string) => (
				<a
					href={url}
					target="_blank"
					rel="noopener noreferrer"
					className="text-[#FF0000] hover:text-[#FF0000] hover:opacity-80 text-2xl"
				>
					<YoutubeOutlined />
				</a>
			),
			width: 80,
			align: "center",
		},
		{
			title: "応募日時",
			dataIndex: "createdAt",
			key: "createdAt",
			render: (date: Date) => date.toLocaleString(),
			sorter: (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
			defaultSortOrder: "descend",
			width: 160,
		},
	];

	return (
		<div className="max-w-7xl mx-auto">
			<div className="flex items-center justify-between mb-8">
				<div className="flex items-center gap-4">
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
					<div>
						<Title level={2} className="!mb-0">
							{eventTitle}
						</Title>
						<p className="text-gray-600 mt-1">投稿動画一覧</p>
					</div>
				</div>
				<Tag color="blue" className="text-lg px-4 py-1">
					投稿件数: {submissions.length}件
				</Tag>
			</div>

			<div className="bg-white rounded-lg shadow">
				<Table
					columns={columns}
					dataSource={submissions}
					loading={loading}
					rowKey="id"
					expandable={{
						expandedRowRender: (record) => (
							<div className="p-4 bg-gray-50 rounded">
								<h4 className="font-medium mb-2">自己紹介・備考</h4>
								<p className="whitespace-pre-wrap text-gray-700">
									{record.introduction || "なし"}
								</p>
							</div>
						),
						rowExpandable: (record) => Boolean(record.introduction),
					}}
					pagination={{
						showSizeChanger: true,
						showTotal: (total) => `全${total}件`,
						defaultPageSize: 10,
						pageSizeOptions: ["10", "20", "50", "100"],
					}}
					scroll={{ x: 1000 }}
				/>
			</div>
		</div>
	);
}
