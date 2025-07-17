import { isEventActive, parseDeadline } from "@/lib/utils/date";
import type {
	CategorizedEvents,
	EventConfig,
	EventsConfig,
	ProcessedEvent,
} from "@/types/events";
/**
 * イベントデータを管理するカスタムフック
 */
import { useMemo } from "react";
import eventsConfig from "../../config/events.json";

/**
 * 単一のイベントデータを取得するフック
 * @param eventId - イベントID
 * @returns 処理済みイベントデータ、存在しない場合はnull
 */
export function useEvent(eventId: string): ProcessedEvent | null {
	return useMemo(() => {
		const events = eventsConfig as EventsConfig;
		const event = events[eventId];

		if (!event) return null;

		return processEvent(event);
	}, [eventId]);
}

/**
 * すべてのイベントデータを取得し、アクティブ/過去で分類するフック
 * @returns カテゴリ別に分類されたイベントデータ
 */
export function useEvents(): CategorizedEvents {
	return useMemo(() => {
		const events = eventsConfig as EventsConfig;
		const allEvents = Object.values(events)
			.filter((event) => event.active)
			.map(processEvent)
			.sort((a, b) => b.deadlineValue - a.deadlineValue);

		return {
			active: allEvents.filter((event) => event.isActive),
			past: allEvents.filter((event) => !event.isActive),
		};
	}, []);
}

/**
 * 特定の条件でフィルタリングされたイベントを取得するフック
 * @param filter - フィルター関数
 * @returns フィルタリングされたイベント配列
 */
export function useFilteredEvents(
	filter: (event: ProcessedEvent) => boolean,
): ProcessedEvent[] {
	return useMemo(() => {
		const events = eventsConfig as EventsConfig;
		return Object.values(events)
			.filter((event) => event.active)
			.map(processEvent)
			.filter(filter)
			.sort((a, b) => b.deadlineValue - a.deadlineValue);
	}, [filter]);
}

/**
 * イベント設定から処理済みイベントデータを作成
 * @param event - 元のイベント設定
 * @returns 処理済みイベントデータ
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
