import { getAllEvents } from "@/lib/getEventsData";
import { isEventActive, parseDeadline } from "@/lib/utils/date";
import type { ProcessedEvent } from "@/types/events";
import { HomePageClient } from "./HomePageClient";

export default async function HomePage() {
	const events = await getAllEvents(false);

	// EventConfig を ProcessedEvent に変換
	const processedEvents: ProcessedEvent[] = events.map((event) => ({
		...event,
		path: `/${event.id}`,
		hasDeadline: Boolean(event.deadline),
		isActive: isEventActive(event.deadline),
		deadlineValue: parseDeadline(event.deadline),
	}));

	const activeEvents = processedEvents
		.filter((e) => e.isActive)
		.sort((a, b) => b.deadlineValue - a.deadlineValue);

	const pastEvents = processedEvents
		.filter((e) => !e.isActive)
		.sort((a, b) => b.deadlineValue - a.deadlineValue);

	return <HomePageClient activeEvents={activeEvents} pastEvents={pastEvents} />;
}
