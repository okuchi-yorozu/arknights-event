/**
 * サーバーサイドでのイベントデータ処理
 * Server Components用のイベントデータ取得・処理関数
 */

import { isEventActive, parseDeadline } from "@/lib/utils/date";
import type {
	CategorizedEvents,
	EventConfig,
	EventsConfig,
	ProcessedEvent,
} from "@/types/events";
import eventsConfig from "../../../config/events.json";

/**
 * イベント設定から処理済みイベントデータを作成
 */
function processEvent(event: EventConfig): ProcessedEvent {
	const deadlineValue = parseDeadline(event.deadline);
	const isActive = isEventActive(event.deadline);

	return {
		...event,
		path: `/${event.id}`,
		hasDeadline: Boolean(event.deadline),
		isActive,
		deadlineValue,
	};
}

/**
 * 全てのアクティブなイベントを取得し、締切日の降順でソート
 */
export function getAllEvents(): ProcessedEvent[] {
	const events = eventsConfig as EventsConfig;

	return Object.values(events)
		.filter((event) => event.active)
		.map(processEvent)
		.sort((a, b) => b.deadlineValue - a.deadlineValue);
}

/**
 * イベントをアクティブ/過去で分類
 */
export function getCategorizedEvents(): CategorizedEvents {
	const allEvents = getAllEvents();

	return {
		active: allEvents.filter((event) => event.isActive),
		past: allEvents.filter((event) => !event.isActive),
	};
}

/**
 * 非同期でイベントデータを取得（Suspense用）
 * 実際のAPIからのデータ取得をシミュレート
 */
export async function getCategorizedEventsAsync(): Promise<CategorizedEvents> {
	// 実際のAPIコールのシミュレート（将来の拡張性のため）
	await new Promise((resolve) => setTimeout(resolve, 100));

	return getCategorizedEvents();
}

/**
 * アクティブイベントのみを非同期で取得
 */
export async function getActiveEventsAsync(): Promise<ProcessedEvent[]> {
	await new Promise((resolve) => setTimeout(resolve, 50));
	return getActiveEvents();
}

/**
 * 過去のイベントのみを非同期で取得
 */
export async function getPastEventsAsync(): Promise<ProcessedEvent[]> {
	await new Promise((resolve) => setTimeout(resolve, 80));
	return getPastEvents();
}

/**
 * 特定のイベントIDでイベントを取得
 */
export function getEventById(eventId: string): ProcessedEvent | null {
	const events = eventsConfig as EventsConfig;
	const event = events[eventId];

	if (!event) return null;

	return processEvent(event);
}

/**
 * アクティブなイベントのみを取得
 */
export function getActiveEvents(): ProcessedEvent[] {
	return getAllEvents().filter((event) => event.isActive);
}

/**
 * 過去のイベントのみを取得
 */
export function getPastEvents(): ProcessedEvent[] {
	return getAllEvents().filter((event) => !event.isActive);
}
