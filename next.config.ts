import type { NextConfig } from "next";

const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "storage.googleapis.com",
			},
		],
	},
	async rewrites() {
		// Chrome 115+ のサードパーティストレージ制限を回避するため、
		// Firebase Auth ハンドラーを同一オリジンとして透過プロキシする。
		// authDomain をアプリの実ドメインに変更することで有効になる。
		// 参考: https://firebase.google.com/docs/auth/web/redirect-best-practices
		return [
			{
				source: "/__/auth/:path*",
				destination: `https://${firebaseProjectId}.firebaseapp.com/__/auth/:path*`,
			},
		];
	},
};

export default nextConfig;
