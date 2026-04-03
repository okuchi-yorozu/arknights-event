/**
 * イベントデータを管理するカスタムフック
 * /api/events エンドポイントから動的に取得する
 */

import { isEventActive } from "@/lib/utils/date";
import type {
	CategorizedEvents,
	EventConfig,
	ProcessedEvent,
} from "@/types/events";
import { useEffect, useMemo, useState } from "react";

function processEvent(event: EventConfig): ProcessedEvent {
	return {
		...event,
		path: `/${event.id}`,
		hasDeadline: Boolean(event.deadline),
		isActive: isEventActive(event.deadline),
	};
}

function useAllEvents(): { events: EventConfig[]; loading: boolean } {
	const [events, setEvents] = useState<EventConfig[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch("/api/events")
			.then((r) => r.json())
			.then((data: EventConfig[]) => setEvents(data))
			.catch(console.error)
			.finally(() => setLoading(false));
	}, []);

	return { events, loading };
}

/**
 * 単一のイベントデータを取得するフック
 */
export function useEvent(eventId: string): {
	event: ProcessedEvent | null;
	loading: boolean;
} {
	const { events, loading } = useAllEvents();
	const event = useMemo(() => {
		const found = events.find((e) => e.id === eventId);
		return found ? processEvent(found) : null;
	}, [events, eventId]);
	return { event, loading };
}

/**
 * すべてのイベントをアクティブ/過去で分類するフック
 */
export function useEvents(): CategorizedEvents & { loading: boolean } {
	const { events, loading } = useAllEvents();

	const categorized = useMemo(() => {
		const processed = events
			.map(processEvent)
			.sort((a, b) => (b.deadline ?? "").localeCompare(a.deadline ?? ""));
		return {
			active: processed.filter((e) => e.isActive),
			past: processed.filter((e) => !e.isActive),
		};
	}, [events]);

	return { ...categorized, loading };
}

/**
 * フィルター関数でイベントを絞り込むフック
 */
export function useFilteredEvents(
	filter: (event: ProcessedEvent) => boolean,
): { events: ProcessedEvent[]; loading: boolean } {
	const { events: rawEvents, loading } = useAllEvents();

	const events = useMemo(() => {
		return rawEvents
			.map(processEvent)
			.filter(filter)
			.sort((a, b) => (b.deadline ?? "").localeCompare(a.deadline ?? ""));
	}, [rawEvents, filter]);

	return { events, loading };
}
