/**
 * 管理者向けイベントCRUD API
 * GET: 全イベント一覧（Firestore + events.json）
 * POST: 新規イベント作成
 */

import { verifyToken } from "@/lib/auth/jwt";
import { getAllEvents, getFirestoreEventIds } from "@/lib/getEventsData";
import type { EventConfig } from "@/types/events";
import { getApp, getApps, initializeApp } from "firebase/app";
import { Timestamp, doc, getFirestore, setDoc } from "firebase/firestore";
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

export async function GET(request: Request) {
	const admin = await verifyAdmin();
	if (!admin) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// ?source=firestore-ids の場合はFirestoreのIDセットを返す
	const { searchParams } = new URL(request.url);
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
	const admin = await verifyAdmin();
	if (!admin) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { id, title, deadline, thumbnailUrl, stages, defaultStage, active } =
			body as EventConfig;

		// IDバリデーション
		if (!id || !/^[a-z0-9-]+$/.test(id)) {
			return NextResponse.json(
				{
					error: "IDは英小文字・数字・ハイフンのみ使用できます",
				},
				{ status: 400 },
			);
		}

		if (!title) {
			return NextResponse.json(
				{ error: "タイトルは必須です" },
				{ status: 400 },
			);
		}

		if (!stages || stages.length === 0) {
			return NextResponse.json(
				{ error: "ステージは1つ以上必要です" },
				{ status: 400 },
			);
		}

		const app = getFirebaseApp();
		const db = getFirestore(app);

		const eventData = {
			id,
			title,
			deadline: deadline ?? null,
			thumbnailUrl: thumbnailUrl ?? "",
			stages,
			defaultStage: defaultStage ?? stages[0].value,
			active: active ?? false,
			calculator: null,
			createdAt: Timestamp.now(),
		};

		await setDoc(doc(db, "events", id), eventData);

		return NextResponse.json({ success: true, id });
	} catch (error) {
		console.error("イベント作成エラー:", error);
		return NextResponse.json(
			{ error: "イベントの作成に失敗しました" },
			{ status: 500 },
		);
	}
}
