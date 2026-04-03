"use client";

import "@ant-design/v5-patch-for-react-19";

import { Menu } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav() {
	const pathname = usePathname();
	const selectedKey = pathname.startsWith("/admin/events") ? "/admin/events" : "/admin";

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

	return (
		<Menu
			mode="horizontal"
			selectedKeys={[selectedKey]}
			items={items}
			className="border-b border-gray-200 px-4"
		/>
	);
}
