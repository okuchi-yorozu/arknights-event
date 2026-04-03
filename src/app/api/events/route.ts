/**
 * 公開イベント API
 * GET: アクティブなイベント一覧（認証不要）
 */

import { getAllEvents } from "@/lib/firebase/events-admin";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const events = await getAllEvents(false);
		return NextResponse.json(events);
	} catch (error) {
		console.error("公開イベント一覧取得エラー:", error);
		return NextResponse.json(
			{ error: "イベント一覧の取得に失敗しました" },
			{ status: 500 },
		);
	}
}
