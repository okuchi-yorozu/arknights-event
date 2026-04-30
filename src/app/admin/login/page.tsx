"use client";

import "@ant-design/v5-patch-for-react-19";
import { clientAuth } from "@/lib/firebase/client";
import { getRedirectResult } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GoogleLoginForm } from "../google-login";

export default function LoginPage() {
	const router = useRouter();
	const [isChecking, setIsChecking] = useState(true);
	const [authError, setAuthError] = useState<string | null>(null);
	// Strict Mode の二重実行を防ぐフラグ
	const initialized = useRef(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: 初回マウント時のみ実行する意図的な設計
	useEffect(() => {
		if (initialized.current) return;
		initialized.current = true;

		const init = async () => {
			// signInWithRedirect で Google から戻ってきた場合の結果を取得
			try {
				const result = await getRedirectResult(clientAuth);
				if (result) {
					// 匿名ユーザーは拒否（Firebase設定が誤っている場合の安全ガード）
					if (result.user.isAnonymous) {
						setAuthError(
							"Firebase の設定が正しくありません。管理者に連絡してください。",
						);
						setIsChecking(false);
						return;
					}

					const idToken = await result.user.getIdToken();
					const res = await fetch("/api/admin/auth", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ idToken }),
					});

					if (res.ok) {
						router.push("/admin");
						return;
					}

					const data = await res.json();
					setAuthError(data.error ?? "ログインに失敗しました");
					setIsChecking(false);
					return;
				}
			} catch (error: unknown) {
				const code = (error as { code?: string }).code;
				// ユーザーがキャンセルした場合はエラー表示しない
				if (code !== "auth/redirect-cancelled-by-user") {
					setAuthError("ログインに失敗しました");
				}
				setIsChecking(false);
				return;
			}

			// リダイレクト結果なし → 既存セッションを確認
			try {
				const res = await fetch("/api/admin/auth/check");
				if (res.ok) {
					router.push("/admin");
					return;
				}
			} catch {}
			setIsChecking(false);
		};

		init();
	}, []);

	if (isChecking) {
		return null;
	}

	return <GoogleLoginForm error={authError} />;
}
