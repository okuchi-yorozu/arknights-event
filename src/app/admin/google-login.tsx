"use client";

import "@ant-design/v5-patch-for-react-19";
import { clientAuth } from "@/lib/firebase/client";
import { GoogleOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useState } from "react";

interface Props {
	onSuccess: () => void;
}

export const GoogleLoginForm = ({ onSuccess }: Props) => {
	const [loading, setLoading] = useState(false);
	const [messageApi, contextHolder] = message.useMessage();

	const handleGoogleLogin = async () => {
		setLoading(true);
		try {
			const provider = new GoogleAuthProvider();
			const result = await signInWithPopup(clientAuth, provider);
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
			}
		} catch (error) {
			console.error("Login error:", error);
			messageApi.error("ログインに失敗しました");
		} finally {
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
