/**
 * 管理者向け画像移行 API
 * POST: /public/events/ の画像を Firebase Storage に移行し Firestore の URL を更新する
 */

import { adminAuth, adminStorage } from "@/lib/firebase/admin";
import { getAllEvents, updateEvent } from "@/lib/firebase/events-admin";
import { cookies } from "next/headers";
import { readFile } from "node:fs/promises";
import path from "node:path";
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

function mimeType(filePath: string): string {
	const ext = filePath.split(".").pop()?.toLowerCase();
	if (ext === "png") return "image/png";
	if (ext === "gif") return "image/gif";
	if (ext === "webp") return "image/webp";
	return "image/jpeg";
}

export async function POST() {
	if (!(await verifyAdmin())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const events = await getAllEvents(true);
	const bucket = adminStorage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
	const publicDir = path.join(process.cwd(), "public");

	const results: { id: string; status: "migrated" | "skipped" | "error"; url?: string; reason?: string }[] = [];

	for (const event of events) {
		// ローカルパス（/events/... または /img/...）のみ対象
		if (!event.thumbnailUrl.startsWith("/")) {
			results.push({ id: event.id, status: "skipped", reason: "すでに外部 URL" });
			continue;
		}

		const localPath = path.join(publicDir, event.thumbnailUrl);
		const storagePath = `events/thumbnails/${event.id}${path.extname(event.thumbnailUrl)}`;

		try {
			const buffer = await readFile(localPath);
			const fileRef = bucket.file(storagePath);

			await fileRef.save(buffer, {
				metadata: { contentType: mimeType(event.thumbnailUrl) },
			});
			await fileRef.makePublic();

			const url = fileRef.publicUrl();
			await updateEvent(event.id, { thumbnailUrl: url });

			results.push({ id: event.id, status: "migrated", url });
		} catch (err) {
			const reason = err instanceof Error ? err.message : "不明なエラー";
			results.push({ id: event.id, status: "error", reason });
		}
	}

	const migrated = results.filter((r) => r.status === "migrated").length;
	const errors = results.filter((r) => r.status === "error").length;

	return NextResponse.json({ migrated, errors, results });
}
