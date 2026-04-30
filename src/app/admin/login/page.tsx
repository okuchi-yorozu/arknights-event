"use client";

import "@ant-design/v5-patch-for-react-19";
import { clientAuth } from "@/lib/firebase/client";
import {
	getRedirectResult,
	onAuthStateChanged,
	signOut,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GoogleLoginForm } from "../google-login";

// リダイレクト後の認証結果をサーバーに送信してセッションを作成する
async function createServerSession(idToken: string): Promise<string | null> {
	const res = await fetch("/api/admin/auth", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ idToken }),
	});
	if (res.ok) return null;
	const data = await res.json();
	return data.error ?? "ログインに失敗しました";
}

export default function LoginPage() {
	const router = useRouter();
	const [isChecking, setIsChecking] = useState(true);
	const [authError, setAuthError] = useState<string | null>(null);
	// Strict Mode の二重実行を防ぐフラグ（ref はマウント間で保持される）
	const initialized = useRef(false);

	useEffect(() => {
		if (initialized.current) return;
		initialized.current = true;

		const initialize = async () => {
			const redirectPending =
				sessionStorage.getItem("google_redirect_pending") === "1";

			if (redirectPending) {
				// OAuthリダイレクト後の処理（sessionStorage フラグで1回だけ実行）
				sessionStorage.removeItem("google_redirect_pending");

				try {
					// getRedirectResult を優先（Chrome の場合は null になることがある）
					let idToken: string | null = null;
					const result = await getRedirectResult(clientAuth);

					if (result) {
						idToken = await result.user.getIdToken();
					} else {
						// フォールバック: onAuthStateChanged で Firebase セッションを取得（一度だけ）
						idToken = await new Promise<string | null>((resolve) => {
							const unsub = onAuthStateChanged(clientAuth, async (user) => {
								unsub(); // 一度だけ実行
								if (user) {
									resolve(await user.getIdToken());
								} else {
									resolve(null);
								}
							});
						});
					}

					if (idToken) {
						const error = await createServerSession(idToken);
						if (!error) {
							router.push("/admin");
							return;
						}
						setAuthError(error);
						await signOut(clientAuth);
					}
				} catch (e) {
					console.error("Redirect auth error:", e);
				}
			} else {
				// 通常アクセス: 既存のサーバーセッションを確認するだけ
				try {
					const res = await fetch("/api/admin/auth/check");
					if (res.ok) {
						router.push("/admin");
						return;
					}
				} catch {}
			}

			setIsChecking(false);
		};

		initialize();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (isChecking) {
		return null;
	}

	return <GoogleLoginForm error={authError} />;
}
