import { adminAuth } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

const ADMIN_EMAILS = (process.env.ADMIN_GOOGLE_EMAILS ?? "")
	.split(",")
	.map((e) => e.trim())
	.filter(Boolean);

export async function POST(request: Request) {
	try {
		const { idToken } = await request.json();

		if (!idToken) {
			return NextResponse.json(
				{ error: "IDトークンが必要です" },
				{ status: 400 },
			);
		}

		const decoded = await adminAuth.verifyIdToken(idToken);

		if (!decoded.email || !ADMIN_EMAILS.includes(decoded.email)) {
			// TODO: デバッグ確認後に削除する
			console.error(
				`[auth] 権限なし: received="${decoded.email}" allowed="${ADMIN_EMAILS.join(",")}"`
			);
			return NextResponse.json(
				{ error: "管理者権限がありません" },
				{ status: 403 },
			);
		}

		const expiresIn = 60 * 60 * 24 * 1000; // 24時間（ミリ秒）
		const sessionCookie = await adminAuth.createSessionCookie(idToken, {
			expiresIn,
		});

		const response = NextResponse.json({ success: true });
		response.cookies.set("admin_session", sessionCookie, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 60 * 60 * 24,
			path: "/",
		});

		return response;
	} catch (error) {
		console.error("Auth error:", error);
		return NextResponse.json({ error: "認証に失敗しました" }, { status: 500 });
	}
}
