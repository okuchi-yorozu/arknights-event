import { verifyToken } from "@/lib/auth/jwt";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
	// adminページへのアクセスのみチェック
	if (!request.nextUrl.pathname.startsWith("/admin")) {
		return NextResponse.next();
	}

	// ログインページとAPI routeはスキップ
	if (
		request.nextUrl.pathname === "/admin/login" ||
		request.nextUrl.pathname.startsWith("/api/")
	) {
		return NextResponse.next();
	}

	const token = request.cookies.get("admin_token")?.value;

	if (!token) {
		return NextResponse.redirect(new URL("/admin/login", request.url));
	}

	try {
		// トークンの検証
		const decoded = await verifyToken(token);
		console.log("Decoded token:", decoded); // デバッグ用

		return NextResponse.next();
	} catch (error) {
		console.error("Token verification error:", error); // デバッグ用
		// トークンが無効な場合はクッキーを削除してログインページへ
		const response = NextResponse.redirect(
			new URL("/admin/login", request.url),
		);
		response.cookies.delete("admin_token");
		return response;
	}
}

export const config = {
	matcher: "/admin/:path*",
};
