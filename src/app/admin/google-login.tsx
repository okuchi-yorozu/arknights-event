"use client";

import "@ant-design/v5-patch-for-react-19";
import { clientAuth } from "@/lib/firebase/client";
import { GoogleOutlined } from "@ant-design/icons";
import { Alert, Button } from "antd";
import {
	GoogleAuthProvider,
	signInWithPopup,
	signInWithRedirect,
} from "firebase/auth";
import { useState } from "react";

interface Props {
	error?: string | null;
}

export const GoogleLoginForm = ({ error }: Props) => {
	const [loading, setLoading] = useState(false);
	const [localError, setLocalError] = useState<string | null>(null);

	const handleGoogleLogin = async () => {
		setLoading(true);
		setLocalError(null);
		const provider = new GoogleAuthProvider();
		try {
			// ポップアップ方式（サーバーセッション作成まで完結）
			const result = await signInWithPopup(clientAuth, provider);
			const idToken = await result.user.getIdToken();
			const res = await fetch("/api/admin/auth", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ idToken }),
			});
			if (res.ok) {
				window.location.href = "/admin";
			} else {
				const data = await res.json();
				setLocalError(data.error ?? "ログインに失敗しました");
				setLoading(false);
			}
		} catch (popupError: unknown) {
			const code = (popupError as { code?: string }).code ?? "";

			if (
				code === "auth/popup-blocked" ||
				code === "auth/popup-closed-by-user"
			) {
				// ポップアップがブロックされた場合のみリダイレクト方式にフォールバック
				// sessionStorage フラグを立てて LoginPage 側に認証処理を委ねる
				sessionStorage.setItem("google_redirect_pending", "1");
				try {
					await signInWithRedirect(clientAuth, provider);
					return; // リダイレクト遷移のためここで終了
				} catch (redirectError) {
					sessionStorage.removeItem("google_redirect_pending");
					console.error("Redirect error:", redirectError);
					setLocalError("ログインに失敗しました");
				}
			} else {
				console.error("Login error:", popupError);
				setLocalError("ログインに失敗しました");
			}
			setLoading(false);
		}
	};

	const displayError = error ?? localError;

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
				<h2 className="text-center text-2xl font-bold text-gray-900">
					管理者ページ
				</h2>
				{displayError && (
					<Alert type="error" message={displayError} showIcon />
				)}
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
	);
};
