/**
 * 管理者向け単一イベント操作 API
 * PATCH: イベント更新
 * DELETE: イベント削除
 */

import { adminAuth } from "@/lib/firebase/admin";
import { deleteEvent, updateEvent } from "@/lib/firebase/events-admin";
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

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	if (!(await verifyAdmin())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;

	try {
		const body = (await request.json()) as Partial<EventConfig>;
		// id は Firestore ドキュメントキーで管理するため除外
		const { id: _id, ...updateData } = body;

		await updateEvent(id, updateData);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("イベント更新エラー:", error);
		return NextResponse.json(
			{ error: "イベントの更新に失敗しました" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	if (!(await verifyAdmin())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;

	try {
		await deleteEvent(id);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("イベント削除エラー:", error);
		return NextResponse.json(
			{ error: "イベントの削除に失敗しました" },
			{ status: 500 },
		);
	}
}
