import { verifyToken } from "@/lib/auth/jwt";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const token = (await cookies()).get("admin_token")?.value;

		if (!token) {
			return NextResponse.json({ error: "No token found" }, { status: 401 });
		}

		// トークンの検証
		const decoded = await verifyToken(token);

		return NextResponse.json({
			authenticated: true,
			role: decoded.role,
		});
	} catch (error) {
		console.error("Auth check error:", error);

		// エラーの種類に応じてレスポンスを返す
		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 401 });
		}

		return NextResponse.json(
			{ error: "Authentication failed" },
			{ status: 401 },
		);
	}
}
