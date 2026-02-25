import { getEventById } from "@/lib/getEventsData";
import { notFound } from "next/navigation";
import { ClientEventPage } from "./ClientEventPage";

interface EventPageProps {
	params: Promise<{
		eventId: string;
	}>;
}

export default async function EventPage({ params }: EventPageProps) {
	const { eventId } = await params;
	const eventConfig = await getEventById(eventId);

	if (!eventConfig || !eventConfig.active) {
		notFound();
	}

	return <ClientEventPage eventConfig={eventConfig} />;
}
