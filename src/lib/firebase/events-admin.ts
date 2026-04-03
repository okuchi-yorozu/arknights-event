/**
 * Firestore イベント CRUD（サーバーサイド専用）
 */

import type { EventConfig } from "@/types/events";
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
 * 全イベントを Firestore から取得
 * @param includeInactive - 非アクティブなイベントも含める場合 true
 */
export async function getAllEvents(includeInactive = false): Promise<EventConfig[]> {
	const snapshot = await adminDb.collection("events").get();
	const events = snapshot.docs.map((doc) => toEventConfig(doc.id, doc.data()));
	return includeInactive ? events : events.filter((e) => e.active);
}

/**
 * 単一イベントを Firestore から取得
 */
export async function getEventById(eventId: string): Promise<EventConfig | null> {
	const doc = await adminDb.collection("events").doc(eventId).get();
	if (!doc.exists) return null;
	return toEventConfig(doc.id, doc.data()!);
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
