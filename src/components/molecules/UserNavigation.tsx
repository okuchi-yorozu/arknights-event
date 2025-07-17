"use client";

import { UserOutlined } from "@ant-design/icons";
import { Button } from "antd";
import Link from "next/link";

/**
 * ユーザーナビゲーションコンポーネント
 * インタラクティブな要素のため Client Component として実装
 */
export function UserNavigation() {
	return (
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
	);
}
