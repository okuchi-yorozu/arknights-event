import type { ProcessedEvent } from "@/types/events";
import { Col, Row, Typography } from "antd";
import { EventCard } from "./EventCard";

const { Title, Text } = Typography;

interface EventSectionProps {
	title: string;
	subtitle: string;
	events: ProcessedEvent[];
	isPast?: boolean;
	icon?: string;
}

/**
 * イベントセクションコンポーネント
 * アクティブイベントまたは過去イベントのセクションを表示
 */
export function EventSection({
	title,
	subtitle,
	events,
	isPast = false,
	icon = "",
}: EventSectionProps) {
	if (events.length === 0) {
		return null;
	}

	return (
		<div className="mb-16">
			<div className="text-center mb-8">
				<Title level={2} className="!mb-2">
					{icon} {title}
				</Title>
				<Text type="secondary">{subtitle}</Text>
			</div>
			<Row gutter={[24, 24]} justify="center">
				{events.map((event) => (
					<Col key={event.path} xs={24} sm={12} lg={8} xl={6}>
						<EventCard event={event} isPast={isPast} />
					</Col>
				))}
			</Row>
		</div>
	);
}
