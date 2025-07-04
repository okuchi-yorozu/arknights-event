import { notFound } from "next/navigation";

import { ClientCalculatePage } from "./ClientCalculatePage";
import eventsConfig from "../../../../config/events.json";

interface CalculatePageProps {
	params: Promise<{
		eventId: string;
	}>;
}

export default async function CalculatePage({ params }: CalculatePageProps) {
	const { eventId } = await params;
	const eventConfig = eventsConfig[eventId as keyof typeof eventsConfig];

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