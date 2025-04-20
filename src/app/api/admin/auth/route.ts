import { createToken } from "@/lib/auth/jwt";

import { NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
	throw new Error("ADMIN_PASSWORD environment variable is not set");
}

export async function POST(request: Request) {
	try {
		const { password } = await request.json();

		if (password !== ADMIN_PASSWORD) {
			return NextResponse.json({ error: "Invalid password" }, { status: 401 });
		}

		// JWTトークンの生成
		const token = await createToken();

		// レスポンスの作成
		const response = NextResponse.json(
			{ success: true },
			{
				headers: {
					"Set-Cookie": `admin_token=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${24 * 60 * 60}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
				},
			},
		);

		return response;
	} catch (error) {
		console.error("Auth error:", error);
		return NextResponse.json(
			{ error: "Authentication failed" },
			{ status: 500 },
		);
	}
}
