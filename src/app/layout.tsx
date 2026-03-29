import { AuthProvider } from "@/lib/firebase/auth-context";
import { AntdRegistry } from "@ant-design/nextjs-registry";

import { Noto_Sans_JP } from "next/font/google";

import { App, ConfigProvider } from "antd";
import jaJP from "antd/es/locale/ja_JP";

import "./globals.css";

const notoSansJP = Noto_Sans_JP({
	subsets: ["latin"],
	weight: ["400", "500", "700"],
	display: "swap",
});

export const metadata = {
	title: "アークナイツ攻略動画企画応募フォーム",
	description: "アークナイツの攻略動画企画に応募するためのフォームです",
};

const RootLayout = ({ children }: React.PropsWithChildren) => (
	<html lang="ja">
		<body className={notoSansJP.className}>
			<AntdRegistry>
				<ConfigProvider
					locale={jaJP}
					theme={{
						token: {
							fontFamily: notoSansJP.style.fontFamily,
							colorPrimary: "#1677ff",
							borderRadius: 6,
						},
						components: {
							Form: {
								labelFontSize: 16,
								controlHeight: 40,
							},
							Input: {
								controlHeight: 40,
							},
							Select: {
								controlHeight: 40,
							},
							Button: {
								controlHeight: 44,
								fontSize: 16,
							},
						},
					}}
				>
					<App>
						<AuthProvider>{children}</AuthProvider>
					</App>
				</ConfigProvider>
			</AntdRegistry>
		</body>
	</html>
);

export default RootLayout;
