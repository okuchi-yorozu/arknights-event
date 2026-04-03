/**
 * Firestore イベント CRUD + events.json フォールバック（サーバーサイド専用）
 */

import eventsConfig from "../../../config/events.json";
import type { EventConfig, EventsConfig } from "@/types/events";
import { adminDb } from "./admin";

function toEventConfig(id: string, data: FirebaseFirestore.DocumentData): EventConfig {
	return {
		id,
		title: data.title ?? "",
		deadline: data.deadline ?? null,
		thumbnailUrl: data.thumbnailUrl ?? "",
		stages: data.stages ?? [],
		defaultStage: data.defaultStage ?? "",
		active: data.active ?? false,
		calculator: data.calculator ?? null,
	};
}

/**
 * Firestore に存在するイベント ID のセットを返す
 */
export async function getFirestoreEventIds(): Promise<Set<string>> {
	const snapshot = await adminDb.collection("events").get();
	return new Set(snapshot.docs.map((doc) => doc.id));
}

/**
 * 全イベントを取得（Firestore 優先、存在しないものは events.json で補完）
 * @param includeInactive - 非アクティブなイベントも含める場合 true
 */
export async function getAllEvents(includeInactive = false): Promise<EventConfig[]> {
	const snapshot = await adminDb.collection("events").get();
	const firestoreEvents = snapshot.docs.map((doc) =>
		toEventConfig(doc.id, doc.data()),
	);
	const firestoreIds = new Set(firestoreEvents.map((e) => e.id));

	// events.json のうち Firestore にないものをフォールバックとして追加
	const jsonFallback = Object.values(eventsConfig as EventsConfig).filter(
		(e) => !firestoreIds.has(e.id),
	);

	const all = [...firestoreEvents, ...jsonFallback];
	return includeInactive ? all : all.filter((e) => e.active);
}

/**
 * 単一イベントを取得（Firestore → events.json の順で検索）
 */
export async function getEventById(eventId: string): Promise<EventConfig | null> {
	const doc = await adminDb.collection("events").doc(eventId).get();
	if (doc.exists) {
		return toEventConfig(doc.id, doc.data()!);
	}

	const json = eventsConfig as EventsConfig;
	return json[eventId] ?? null;
}

/**
 * イベントを Firestore に作成または上書き保存
 */
export async function setEvent(id: string, data: Omit<EventConfig, "id">): Promise<void> {
	await adminDb.collection("events").doc(id).set(data);
}

/**
 * Firestore のイベントを部分更新
 */
export async function updateEvent(id: string, data: Partial<Omit<EventConfig, "id">>): Promise<void> {
	await adminDb.collection("events").doc(id).update(data);
}

/**
 * Firestore からイベントを削除
 */
export async function deleteEvent(id: string): Promise<void> {
	await adminDb.collection("events").doc(id).delete();
}
