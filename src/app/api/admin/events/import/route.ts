/**
 * 管理者向け events.json 一括インポート API
 * POST: events.json の全イベントを Firestore に書き込む（既存は上書き）
 */

import { adminAuth } from "@/lib/firebase/admin";
import { setEvent } from "@/lib/firebase/events-admin";
import type { EventsConfig } from "@/types/events";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import eventsConfig from "../../../../../../config/events.json";

async function verifyAdmin(): Promise<boolean> {
	const cookieStore = await cookies();
	const sessionCookie = cookieStore.get("admin_session")?.value;
	if (!sessionCookie) return false;
	try {
		await adminAuth.verifySessionCookie(sessionCookie, true);
		return true;
	} catch {
		return false;
	}
}

export async function POST() {
	if (!(await verifyAdmin())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const events = eventsConfig as EventsConfig;
		const entries = Object.entries(events);

		await Promise.all(
			entries.map(([id, event]) =>
				setEvent(id, {
					title: event.title,
					deadline: event.deadline,
					thumbnailUrl: event.thumbnailUrl,
					stages: event.stages,
					defaultStage: event.defaultStage,
					active: event.active,
				}),
			),
		);

		return NextResponse.json({ success: true, count: entries.length });
	} catch (error) {
		console.error("インポートエラー:", error);
		return NextResponse.json(
			{ error: "インポートに失敗しました" },
			{ status: 500 },
		);
	}
}
