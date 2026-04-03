/**
 * 管理者向けイベントサムネイル画像アップロード API
 * POST: Firebase Storage に画像をアップロードし、公開 URL を返す
 */

import { adminAuth, adminStorage } from "@/lib/firebase/admin";
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

export async function POST(request: Request) {
	if (!(await verifyAdmin())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const formData = await request.formData();
		const file = formData.get("file") as File | null;

		if (!file) {
			return NextResponse.json(
				{ error: "ファイルが選択されていません" },
				{ status: 400 },
			);
		}

		const buffer = Buffer.from(await file.arrayBuffer());
		const ext = file.name.split(".").pop() ?? "jpg";
		const path = `events/thumbnails/${Date.now()}.${ext}`;

		const bucket = adminStorage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
		const fileRef = bucket.file(path);

		await fileRef.save(buffer, {
			metadata: { contentType: file.type || "image/jpeg" },
		});
		await fileRef.makePublic();

		const url = fileRef.publicUrl();
		return NextResponse.json({ url });
	} catch (error) {
		console.error("画像アップロードエラー:", error);
		return NextResponse.json(
			{ error: "画像のアップロードに失敗しました" },
			{ status: 500 },
		);
	}
}
