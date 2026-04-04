/**
 * 管理者向けイベント API
 * GET: 全イベント一覧（Firestore + events.json フォールバック）
 * POST: 新規イベント作成（Firestore）
 */

import { adminAuth } from "@/lib/firebase/admin";
import {
	getAllEvents,
	getFirestoreEventIds,
	setEvent,
} from "@/lib/firebase/events-admin";
import type { EventConfig } from "@/types/events";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

export async function GET(request: Request) {
	if (!(await verifyAdmin())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { searchParams } = new URL(request.url);

	// ?source=firestore-ids の場合は Firestore 管理のイベント ID 一覧を返す
	if (searchParams.get("source") === "firestore-ids") {
		try {
			const ids = await getFirestoreEventIds();
			return NextResponse.json(Array.from(ids));
		} catch (error) {
			console.error("FirestoreイベントID取得エラー:", error);
			return NextResponse.json(
				{ error: "FirestoreイベントIDの取得に失敗しました" },
				{ status: 500 },
			);
		}
	}

	try {
		const events = await getAllEvents(true);
		return NextResponse.json(events);
	} catch (error) {
		console.error("イベント一覧取得エラー:", error);
		return NextResponse.json(
			{ error: "イベント一覧の取得に失敗しました" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	if (!(await verifyAdmin())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = (await request.json()) as EventConfig;
		const { id, title, deadline, thumbnailUrl, stages, defaultStage, active } = body;

		if (!id || !/^[a-z0-9-]+$/.test(id)) {
			return NextResponse.json(
				{ error: "IDは英小文字・数字・ハイフンのみ使用できます" },
				{ status: 400 },
			);
		}
		if (!title) {
			return NextResponse.json({ error: "タイトルは必須です" }, { status: 400 });
		}
		if (!stages || stages.length === 0) {
			return NextResponse.json(
				{ error: "ステージは1つ以上必要です" },
				{ status: 400 },
			);
		}

		await setEvent(id, {
			title,
			deadline: deadline ?? null,
			thumbnailUrl: thumbnailUrl ?? "",
			stages,
			defaultStage: defaultStage ?? stages[0].value,
			active: active ?? false,
		});

		return NextResponse.json({ success: true, id });
	} catch (error) {
		console.error("イベント作成エラー:", error);
		return NextResponse.json(
			{ error: "イベントの作成に失敗しました" },
			{ status: 500 },
		);
	}
}
