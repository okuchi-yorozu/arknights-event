import { getEventById } from "@/lib/firebase/events-admin";
import { notFound } from "next/navigation";
import { ClientCalculatePage } from "./ClientCalculatePage";

interface CalculatePageProps {
	params: Promise<{
		eventId: string;
	}>;
}

export default async function CalculatePage({ params }: CalculatePageProps) {
	const { eventId } = await params;
	const eventConfig = await getEventById(eventId);

	if (!eventConfig || !eventConfig.active || !eventConfig.calculator) {
		notFound();
	}

	return (
		<ClientCalculatePage
			title={eventConfig.calculator.title}
			fiveStarOperatorImages={eventConfig.calculator.fiveStarOperatorImages}
		/>
	);
}
