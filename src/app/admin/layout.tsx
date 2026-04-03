import { AdminNav } from "./AdminNav";
import { ConfigProvider } from "antd";
import jaJP from "antd/locale/ja_JP";

export const metadata = {
	title: "管理者画面 - アークナイツ攻略動画企画応募",
	description: "応募された攻略動画の管理画面です",
};

export default function AdminLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<ConfigProvider
			locale={jaJP}
			theme={{
				components: {
					Table: {
						headerBg: "#f5f5f5",
						headerColor: "#1f2937",
						headerSplitColor: "#e5e7eb",
						rowHoverBg: "#f3f4f6",
					},
				},
			}}
		>
			<AdminNav />
			{children}
		</ConfigProvider>
	);
}
