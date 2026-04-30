"use client";

import "@ant-design/v5-patch-for-react-19";
import { clientAuth } from "@/lib/firebase/client";
import { GoogleOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import { useState } from "react";

export const GoogleLoginForm = () => {
	const [loading, setLoading] = useState(false);
	const [messageApi, contextHolder] = message.useMessage();

	const handleGoogleLogin = async () => {
		setLoading(true);
		try {
			const provider = new GoogleAuthProvider();
			await signInWithRedirect(clientAuth, provider);
		} catch (error) {
			console.error("Login error:", error);
			messageApi.error("ログインに失敗しました");
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
