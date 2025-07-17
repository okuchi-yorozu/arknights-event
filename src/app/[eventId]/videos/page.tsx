import { isEventActive } from "@/lib/utils/date";
import type { EventsConfig } from "@/types/events";
import { notFound } from "next/navigation";
import eventsConfig from "../../../../config/events.json";
import { AccessDeniedPage } from "./AccessDeniedPage";
import { VideoList } from "./VideoList";

interface Props {
	params: Promise<{ eventId: string }>;
}

export default async function VideosPage({ params }: Props) {
	const { eventId } = await params;
	const events = eventsConfig as EventsConfig;
	const event = events[eventId];

	if (!event) {
		notFound();
	}

	// 現在進行中のイベントの場合はアクセス拒否
	if (isEventActive(event.deadline)) {
		return (
			<main className="min-h-screen bg-gray-50">
				<div className="container mx-auto px-4 py-8">
					<AccessDeniedPage eventTitle={event.title} />
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 py-8">
				<VideoList eventId={eventId} eventTitle={event.title} />
			</div>
		</main>
	);
}
