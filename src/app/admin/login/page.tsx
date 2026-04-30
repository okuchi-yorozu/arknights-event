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
	// Strict Mode の二重実行を防ぐためのフラグ
	const initialized = useRef(false);

	useEffect(() => {
		if (initialized.current) return;
		initialized.current = true;

		const initialize = async () => {
			// 1. Googleリダイレクト後の認証結果を確認
			try {
				const result = await getRedirectResult(clientAuth);
				if (result) {
					const idToken = await result.user.getIdToken();
					const response = await fetch("/api/admin/auth", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ idToken }),
					});
					if (response.ok) {
						router.push("/admin");
						return;
					}
					console.error(
						"Auth failed:",
						response.status,
						await response.text(),
					);
				}
			} catch (error) {
				console.error("Redirect result error:", error);
			}

			// 2. 既存セッションを確認
			try {
				const response = await fetch("/api/admin/auth/check");
				if (response.ok) {
					router.push("/admin");
					return;
				}
			} catch (error) {
				console.error("Auth check error:", error);
			}
			setIsChecking(false);
		};

		initialize();
	}, [router]);

	if (isChecking) {
		return null;
	}

	return <GoogleLoginForm />;
}
