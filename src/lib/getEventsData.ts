/**
 * サーバーサイドでFirestore+静的設定をマージするユーティリティ
 */

import { getApp, getApps, initializeApp } from "firebase/app";
import {
	collection,
	doc,
	getDoc,
	getDocs,
	getFirestore,
} from "firebase/firestore";
import eventsConfig from "../../config/events.json";
import type { EventConfig, EventsConfig } from "@/types/events";

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

/**
 * Firestoreからイベント一覧を取得
 */
async function getFirestoreEvents(): Promise<EventConfig[]> {
	try {
		const app = getFirebaseApp();
		const db = getFirestore(app);
		const snapshot = await getDocs(collection(db, "events"));
		return snapshot.docs.map((document) => {
			const data = document.data();
			return {
				id: document.id,
				title: data.title ?? "",
				deadline: data.deadline ?? null,
				thumbnailUrl: data.thumbnailUrl ?? "",
				stages: data.stages ?? [],
				defaultStage: data.defaultStage ?? "",
				active: data.active ?? false,
				calculator: data.calculator ?? null,
			} as EventConfig;
		});
	} catch (error) {
		console.error("Firestoreからのイベント取得に失敗:", error);
		return [];
	}
}

/**
 * FirestoreのイベントIDのセットを取得
 */
export async function getFirestoreEventIds(): Promise<Set<string>> {
	const events = await getFirestoreEvents();
	return new Set(events.map((e) => e.id));
}

/**
 * 全イベント取得（Firestoreを優先、events.jsonはフォールバック）
 * @param includeInactive - 非アクティブなイベントも含めるか
 */
export async function getAllEvents(
	includeInactive = false,
): Promise<EventConfig[]> {
	const staticEvents = eventsConfig as EventsConfig;
	const firestoreEvents = await getFirestoreEvents();

	// FirestoreイベントのIDセット
	const firestoreIds = new Set(firestoreEvents.map((e) => e.id));

	// 静的設定のイベントのうち、Firestoreに存在しないものをフォールバックとして使用
	const staticFallback = Object.values(staticEvents).filter(
		(e) => !firestoreIds.has(e.id),
	);

	const allEvents = [...firestoreEvents, ...staticFallback];

	if (includeInactive) {
		return allEvents;
	}

	return allEvents.filter((e) => e.active);
}

/**
 * 単一イベント取得（Firestore→events.json の順で検索）
 * @param eventId - イベントID
 */
export async function getEventById(
	eventId: string,
): Promise<EventConfig | null> {
	// まずFirestoreから検索
	try {
		const app = getFirebaseApp();
		const db = getFirestore(app);
		const docRef = doc(db, "events", eventId);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			const data = docSnap.data();
			return {
				id: docSnap.id,
				title: data.title ?? "",
				deadline: data.deadline ?? null,
				thumbnailUrl: data.thumbnailUrl ?? "",
				stages: data.stages ?? [],
				defaultStage: data.defaultStage ?? "",
				active: data.active ?? false,
				calculator: data.calculator ?? null,
			} as EventConfig;
		}
	} catch (error) {
		console.error("Firestoreからの単一イベント取得に失敗:", error);
	}

	// フォールバック: events.jsonから検索
	const staticEvents = eventsConfig as EventsConfig;
	return staticEvents[eventId] ?? null;
}
