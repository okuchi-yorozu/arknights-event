"use client";

import "@ant-design/v5-patch-for-react-19";
import { clientAuth } from "@/lib/firebase/client";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GoogleLoginForm } from "../google-login";

export default function LoginPage() {
	const router = useRouter();
	const [isChecking, setIsChecking] = useState(true);
	const [authError, setAuthError] = useState<string | null>(null);
	// サーバーセッション作成の重複実行を防ぐフラグ
	const sessionCreating = useRef(false);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(clientAuth, async (user) => {
			if (!user) {
				setIsChecking(false);
				return;
			}

			if (sessionCreating.current) return;
			sessionCreating.current = true;

			try {
				// 既存のサーバーセッションを確認
				const checkRes = await fetch("/api/admin/auth/check");
				if (checkRes.ok) {
					router.push("/admin");
					return;
				}

				// サーバーセッションを新規作成
				const idToken = await user.getIdToken();
				const authRes = await fetch("/api/admin/auth", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ idToken }),
				});

				if (authRes.ok) {
					router.push("/admin");
				} else {
					const data = await authRes.json();
					setAuthError(data.error ?? "ログインに失敗しました");
					await signOut(clientAuth);
					setIsChecking(false);
				}
			} catch (error) {
				console.error("Auth error:", error);
				setIsChecking(false);
			} finally {
				sessionCreating.current = false;
			}
		});

		return () => unsubscribe();
	}, [router]);

	if (isChecking) {
		return null;
	}

	return <GoogleLoginForm error={authError} />;
}
