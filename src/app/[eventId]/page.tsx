import { UserOutlined } from "@ant-design/icons";
import { Button, Typography } from "antd";
import Link from "next/link";
import { notFound } from "next/navigation";

import eventsConfig from "../../../config/events.json";
import { ClientEventPage } from "./ClientEventPage";

interface EventPageProps {
	params: Promise<{
		eventId: string;
	}>;
}

export default async function EventPage({ params }: EventPageProps) {
	const { eventId } = await params;
	const eventConfig = eventsConfig[eventId as keyof typeof eventsConfig];

	if (!eventConfig || !eventConfig.active) {
		notFound();
	}

	return <ClientEventPage eventConfig={eventConfig} />;
}
