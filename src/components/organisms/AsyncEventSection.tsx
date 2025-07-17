import { getActiveEventsAsync, getPastEventsAsync } from "@/lib/events/server";
import { EventSection } from "./EventSection";

/**
 * アクティブイベントセクション（非同期）
 */
export async function ActiveEventsSection() {
	const activeEvents = await getActiveEventsAsync();

	return (
		<EventSection
			title="現在進行中のイベント"
			subtitle="現在応募可能なイベントです"
			events={activeEvents}
			icon="🔥"
		/>
	);
}

/**
 * 過去のイベントセクション（非同期）
 */
export async function PastEventsSection() {
	const pastEvents = await getPastEventsAsync();

	return (
		<EventSection
			title="過去のイベント"
			subtitle="過去に募集したイベントの一覧です"
			events={pastEvents}
			isPast={true}
			icon="📚"
		/>
	);
}
