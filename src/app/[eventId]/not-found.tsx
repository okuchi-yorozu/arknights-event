"use client";

import "@ant-design/v5-patch-for-react-19";
import { Button, Result } from "antd";
import Link from "next/link";

export default function EventNotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<Result
				status="404"
				title="404"
				subTitle="指定されたイベントは存在しません"
				extra={
					<Link href="/">
						<Button type="primary">ホームに戻る</Button>
					</Link>
				}
			/>
		</div>
	);
}
