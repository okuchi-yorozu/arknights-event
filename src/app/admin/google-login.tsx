"use client";

import "@ant-design/v5-patch-for-react-19";
import { clientAuth } from "@/lib/firebase/client";
import { GoogleOutlined } from "@ant-design/icons";
import { Alert, Button } from "antd";
import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
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
			await signInWithRedirect(clientAuth, provider);
			// ページ遷移するためここより後は実行されない
		} catch (redirectError: unknown) {
			const code = (redirectError as { code?: string }).code ?? "";
			setLocalError(`ログインに失敗しました（${code}）`);
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
				{displayError && <Alert type="error" message={displayError} showIcon />}
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
