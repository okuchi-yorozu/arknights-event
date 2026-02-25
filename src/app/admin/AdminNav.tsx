"use client";

import "@ant-design/v5-patch-for-react-19";

import { Menu } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav() {
	const pathname = usePathname();

	const items = [
		{
			key: "/admin",
			label: <Link href="/admin">応募一覧</Link>,
		},
		{
			key: "/admin/events",
			label: <Link href="/admin/events">イベント管理</Link>,
		},
	];

	// アクティブなメニューキーを判定
	const selectedKey = pathname === "/admin" ? "/admin" : "/admin/events";

	return (
		<Menu
			mode="horizontal"
			selectedKeys={[selectedKey]}
			items={items}
			className="border-b border-gray-200 px-4"
		/>
	);
}
