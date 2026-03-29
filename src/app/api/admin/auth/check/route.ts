import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const cookieStore = await cookies();
		const sessionCookie = cookieStore.get("admin_session")?.value;

		if (!sessionCookie) {
			return NextResponse.json(
				{ error: "セッションがありません" },
				{ status: 401 },
			);
		}

		const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
		return NextResponse.json({ authenticated: true, email: decoded.email });
	} catch {
		return NextResponse.json(
			{ error: "無効なセッションです" },
			{ status: 401 },
		);
	}
}
