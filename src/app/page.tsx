export const dynamic = "force-dynamic";

import { getAllEvents } from "@/lib/firebase/events-admin";
import { isEventActive } from "@/lib/utils/date";
import type { ProcessedEvent } from "@/types/events";
import { HomePageClient } from "./HomePageClient";

export default async function HomePage() {
	const events = await getAllEvents(true);

	const processedEvents: ProcessedEvent[] = events.map((event) => ({
		...event,
		path: `/${event.id}`,
		hasDeadline: Boolean(event.deadline),
		isActive: isEventActive(event.deadline),
	}));

	const activeEvents = processedEvents
		.filter((e) => e.isActive)
		.sort((a, b) => (b.deadline ?? "").localeCompare(a.deadline ?? ""));

	const pastEvents = processedEvents
		.filter((e) => !e.isActive)
		.sort((a, b) => (b.deadline ?? "").localeCompare(a.deadline ?? ""));

	return <HomePageClient activeEvents={activeEvents} pastEvents={pastEvents} />;
}
