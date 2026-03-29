import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
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

	// Firebase Admin SDK は Edge Runtime で動作しないため存在確認のみ行う。
	// 詳細な検証は /api/admin/auth/check（Node.js Runtime）で実施。
	const sessionCookie = request.cookies.get("admin_session")?.value;

	if (!sessionCookie) {
		return NextResponse.redirect(new URL("/admin/login", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: "/admin/:path*",
};
