import { notFound } from "next/navigation";
import eventsConfig from "../../../../config/events.json";
import { VideoList } from "./VideoList";
import { AccessDeniedPage } from "./AccessDeniedPage";

interface EventConfig {
	id: string;
	title: string;
	deadline: string | null;
	thumbnailUrl: string;
	stages: Array<{ value: string; label: string }>;
	defaultStage: string;
	active: boolean;
	calculator?: {
		title: string;
		fiveStarOperatorImages: string[];
	} | null;
}

interface Props {
	params: Promise<{ eventId: string }>;
}

// 締切日をパースして比較用の値を返す関数
function parseDeadline(deadline: string | null): number {
	if (!deadline) return 0;

	const match = deadline.match(/(\d+)\/(\d+)/);
	if (!match) return 0;

	const month = parseInt(match[1], 10);
	const day = parseInt(match[2], 10);

	return month * 100 + day;
}

// 現在日付を取得して比較用の値を返す関数
function getCurrentDate(): number {
	const now = new Date();
	const month = now.getMonth() + 1;
	const day = now.getDate();
	return month * 100 + day;
}

// 締切日が現在日付より後かどうかを判定する関数
function isEventActive(deadline: string | null): boolean {
	if (!deadline) return false;
	const currentDate = getCurrentDate();
	const deadlineDate = parseDeadline(deadline);
	return deadlineDate >= currentDate;
}

export default async function VideosPage({ params }: Props) {
	const { eventId } = await params;
	const events = eventsConfig as Record<string, EventConfig>;
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
