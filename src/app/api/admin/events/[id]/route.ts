/**
 * 管理者向け単一イベント操作API
 * PATCH: イベント更新
 * DELETE: イベント削除
 */

import { verifyToken } from "@/lib/auth/jwt";
import { getApp, getApps, initializeApp } from "firebase/app";
import { deleteDoc, doc, getFirestore, updateDoc } from "firebase/firestore";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const firebaseConfig = {
	apiKey: process.env.FIREBASE_API_KEY,
	authDomain: process.env.FIREBASE_AUTH_DOMAIN,
	projectId: process.env.FIREBASE_PROJECT_ID,
	storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.FIREBASE_APP_ID,
};

function getFirebaseApp() {
	return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
}

async function verifyAdmin() {
	const token = (await cookies()).get("admin_token")?.value;
	if (!token) return null;
	try {
		return await verifyToken(token);
	} catch {
		return null;
	}
}

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const admin = await verifyAdmin();
	if (!admin) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;

	try {
		const body = await request.json();
		// createdAt と id はFirestoreで管理するため除外
		const { createdAt: _createdAt, id: _id, ...updateData } = body;

		const app = getFirebaseApp();
		const db = getFirestore(app);

		await updateDoc(doc(db, "events", id), updateData);

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
	const admin = await verifyAdmin();
	if (!admin) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;

	try {
		const app = getFirebaseApp();
		const db = getFirestore(app);

		await deleteDoc(doc(db, "events", id));

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("イベント削除エラー:", error);
		return NextResponse.json(
			{ error: "イベントの削除に失敗しました" },
			{ status: 500 },
		);
	}
}
