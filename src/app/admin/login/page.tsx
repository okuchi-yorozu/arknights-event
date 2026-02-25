"use client";

import "@ant-design/v5-patch-for-react-19";

import { signInWithGoogle } from "@/lib/firebase/auth";
import { Button, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;

export default function LoginPage() {
	const router = useRouter();
	const [isChecking, setIsChecking] = useState(true);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await fetch("/api/admin/auth/check");
				if (response.ok) {
					router.push("/admin");
					return;
				}
			} catch {
				// 未ログイン
			}
			setIsChecking(false);
		};
		checkAuth();
	}, [router]);

	const handleGoogleLogin = async () => {
		setLoading(true);
		setError("");
		try {
			const idToken = await signInWithGoogle();

			const response = await fetch("/api/admin/auth", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ idToken }),
			});

			if (response.ok) {
				router.push("/admin");
			} else {
				const data = await response.json();
				setError(data.error ?? "ログインに失敗しました");
			}
		} catch {
			setError("ログインに失敗しました");
		} finally {
			setLoading(false);
		}
	};

	if (isChecking) return null;

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow text-center">
				<div>
					<Title level={2}>管理者ページ</Title>
					<Text type="secondary">許可されたGoogleアカウントでログインしてください</Text>
				</div>

				{error && (
					<Text type="danger" className="block">
						{error}
					</Text>
				)}

				<Button
					type="primary"
					size="large"
					loading={loading}
					onClick={handleGoogleLogin}
					block
				>
					Googleでログイン
				</Button>
			</div>
		</div>
	);
}
