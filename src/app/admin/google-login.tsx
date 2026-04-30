"use client";

import "@ant-design/v5-patch-for-react-19";
import { clientAuth } from "@/lib/firebase/client";
import { GoogleOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import {
	GoogleAuthProvider,
	getRedirectResult,
	signInWithRedirect,
} from "firebase/auth";
import { useEffect, useState } from "react";

interface Props {
	onSuccess: () => void;
}

export const GoogleLoginForm = ({ onSuccess }: Props) => {
	const [loading, setLoading] = useState(true);
	const [messageApi, contextHolder] = message.useMessage();

	// Googleリダイレクト後に戻ってきた際の結果を処理する
	useEffect(() => {
		const handleRedirectResult = async () => {
			try {
				const result = await getRedirectResult(clientAuth);
				if (!result) {
					// リダイレクト経由でない通常アクセス
					setLoading(false);
					return;
				}

				const idToken = await result.user.getIdToken();
				const response = await fetch("/api/admin/auth", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ idToken }),
				});

				if (response.ok) {
					onSuccess();
				} else {
					const data = await response.json();
					messageApi.error(data.error ?? "ログインに失敗しました");
					setLoading(false);
				}
			} catch (error) {
				console.error("Redirect result error:", error);
				setLoading(false);
			}
		};

		handleRedirectResult();
		// onSuccess・messageApi はマウント時の1回のみ実行するため依存配列から除外
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleGoogleLogin = async () => {
		setLoading(true);
		try {
			const provider = new GoogleAuthProvider();
			await signInWithRedirect(clientAuth, provider);
		} catch (error) {
			console.error("Login error:", error);
			messageApi.error("ログインに失敗しました");
			setLoading(false);
		}
	};

	return (
		<>
			{contextHolder}
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
					<h2 className="text-center text-2xl font-bold text-gray-900">
						管理者ページ
					</h2>
					<Button
						type="primary"
						icon={<GoogleOutlined />}
						onClick={handleGoogleLogin}
						loading={loading}
						block
						size="large"
					>
						Googleでログイン
					</Button>
				</div>
			</div>
		</>
	);
};
