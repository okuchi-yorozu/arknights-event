"use client";

import "@ant-design/v5-patch-for-react-19";
import { clientAuth } from "@/lib/firebase/client";
import { GoogleOutlined } from "@ant-design/icons";
import { Alert, Button } from "antd";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
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
			const result = await signInWithPopup(clientAuth, provider);

			// 匿名ユーザーは拒否（Firebase設定が誤っている場合の安全ガード）
			if (result.user.isAnonymous) {
				setLocalError(
					"Firebase の設定が正しくありません。管理者に連絡してください。",
				);
				setLoading(false);
				return;
			}

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
			// TODO: デバッグ確認後に削除する
			console.error("popup error code:", code, popupError);

			if (code === "auth/popup-blocked") {
				setLocalError(
					`ポップアップがブロックされました（${code}）。アドレスバーのアイコンをクリックして、このサイトのポップアップを許可してください。`,
				);
			} else if (code === "auth/popup-closed-by-user") {
				// ユーザーがキャンセルした場合はエラー表示しない
			} else {
				setLocalError(`ログインに失敗しました（${code}）`);
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
