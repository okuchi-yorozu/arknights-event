import { createToken } from "@/lib/auth/jwt";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { NextResponse } from "next/server";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

if (!PROJECT_ID) throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set");
if (!ADMIN_EMAIL) throw new Error("ADMIN_EMAIL environment variable is not set");

// Google の公開鍵（jose が自動キャッシュ）
const JWKS = createRemoteJWKSet(
	new URL(
		"https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
	),
);

export async function POST(request: Request) {
	try {
		const { idToken } = await request.json();

		if (!idToken) {
			return NextResponse.json(
				{ error: "IDトークンが必要です" },
				{ status: 400 },
			);
		}

		// Firebase ID トークンを検証
		const { payload } = await jwtVerify(idToken, JWKS, {
			issuer: `https://securetoken.google.com/${PROJECT_ID}`,
			audience: PROJECT_ID,
		});

		// 許可されたメールアドレスか確認
		if (payload.email !== ADMIN_EMAIL) {
			return NextResponse.json(
				{ error: "このアカウントには権限がありません" },
				{ status: 403 },
			);
		}

		// 既存の JWT を発行（ミドルウェアはそのまま）
		const token = await createToken();

		return NextResponse.json(
			{ success: true },
			{
				headers: {
					"Set-Cookie": `admin_token=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${24 * 60 * 60}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
				},
			},
		);
	} catch (error) {
		console.error("Auth error:", error);
		return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
	}
}
