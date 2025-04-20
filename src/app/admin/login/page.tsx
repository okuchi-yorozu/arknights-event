"use client";

import "@ant-design/v5-patch-for-react-19";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { PasswordForm } from "../password";

export default function LoginPage() {
	const router = useRouter();
	const [isChecking, setIsChecking] = useState(true);

	useEffect(() => {
		// ログイン状態をチェック
		const checkAuth = async () => {
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

		checkAuth();
	}, [router]);

	const handleSuccess = () => {
		router.push("/admin");
	};

	if (isChecking) {
		return null; // または適切なローディング表示
	}

	return <PasswordForm onSuccess={handleSuccess} />;
}
