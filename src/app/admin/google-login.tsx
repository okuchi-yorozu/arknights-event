"use client";

import "@ant-design/v5-patch-for-react-19";
import { clientAuth } from "@/lib/firebase/client";
import { GoogleOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import {
	GoogleAuthProvider,
	signInWithPopup,
	signInWithRedirect,
} from "firebase/auth";
import { useState } from "react";

export const GoogleLoginForm = () => {
	const [loading, setLoading] = useState(false);
	const [messageApi, contextHolder] = message.useMessage();

	const postIdToken = async (idToken: string): Promise<boolean> => {
		const response = await fetch("/api/admin/auth", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ idToken }),
		});
		if (!response.ok) {
			const data = await response.json();
			messageApi.error(data.error ?? "ログインに失敗しました");
			return false;
		}
		return true;
	};

	const handleGoogleLogin = async () => {
		setLoading(true);
		const provider = new GoogleAuthProvider();
		try {
			// ポップアップ方式を試みる（Safari ITP の影響を受けない）
			const result = await signInWithPopup(clientAuth, provider);
			const idToken = await result.user.getIdToken();
			if (await postIdToken(idToken)) {
				window.location.href = "/admin";
			} else {
				setLoading(false);
			}
		} catch (popupError: unknown) {
			const code =
				popupError instanceof Error &&
				"code" in popupError &&
				typeof (popupError as { code: unknown }).code === "string"
					? (popupError as { code: string }).code
					: "";

			if (code === "auth/popup-blocked" || code === "auth/popup-closed-by-user") {
				// ポップアップがブロックされた場合はリダイレクト方式にフォールバック
				try {
					await signInWithRedirect(clientAuth, provider);
					return; // リダイレクトで遷移するためここで終了
				} catch (redirectError) {
					console.error("Redirect error:", redirectError);
					messageApi.error("ログインに失敗しました");
				}
			} else {
				console.error("Login error:", popupError);
				messageApi.error("ログインに失敗しました");
			}
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
