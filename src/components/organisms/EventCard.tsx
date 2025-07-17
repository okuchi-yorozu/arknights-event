import type { ProcessedEvent } from "@/types/events";
import { CalendarOutlined } from "@ant-design/icons";
import { Button, Card, Tag } from "antd";
import Image from "next/image";
import Link from "next/link";

interface EventCardProps {
	event: ProcessedEvent;
	isPast?: boolean;
}

/**
 * イベントカードコンポーネント
 * 静的なコンテンツを表示するため、Server Component として実装
 */
export function EventCard({ event, isPast = false }: EventCardProps) {
	return (
		<Card
			className={`h-full [&_.ant-card-body]:px-4 [&_.ant-card-body]:py-4 transition-shadow hover:shadow-lg cursor-default ${
				isPast ? "opacity-80" : ""
			}`}
			cover={
				<div className="relative aspect-video bg-gray-100">
					<Image
						src={event.thumbnailUrl}
						alt={event.title}
						fill
						className="object-cover"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
						priority={!isPast} // アクティブイベントは優先ロード
					/>
				</div>
			}
			actions={[
				<div key="apply" className="mx-4">
					<Link href={isPast ? `${event.path}/videos` : event.path}>
						<Button type={isPast ? "default" : "primary"} block>
							{isPast ? "動画一覧を見る" : "応募ページへ"}
						</Button>
					</Link>
				</div>,
			]}
		>
			<div className="space-y-2">
				<div className="text-base font-medium leading-relaxed line-clamp-2 min-h-[3rem]">
					{event.title}
				</div>
				<div className="min-h-[2rem] flex items-center">
					{event.hasDeadline && (
						<div className="flex items-center gap-1">
							<CalendarOutlined
								className={isPast ? "text-gray-400" : "text-red-500"}
							/>
							<Tag color={isPast ? "default" : "red"} className="text-sm">
								{event.deadline}
							</Tag>
						</div>
					)}
				</div>
			</div>
		</Card>
	);
}
