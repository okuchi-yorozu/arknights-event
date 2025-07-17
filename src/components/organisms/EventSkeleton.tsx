import { Card, Col, Row, Skeleton } from "antd";

interface EventSkeletonProps {
	count?: number;
}

/**
 * イベントカードのスケルトンローディング
 * Suspenseのフォールバックとして使用
 */
export function EventSkeleton({ count = 4 }: EventSkeletonProps) {
	// 安定したキーの生成
	const skeletonKeys = Array.from(
		{ length: count },
		(_, index) =>
			`skeleton-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
	);

	return (
		<div className="mb-16">
			<div className="text-center mb-8">
				<Skeleton.Input
					active
					size="large"
					style={{ width: 300, height: 32 }}
					className="mb-2"
				/>
				<br />
				<Skeleton.Input
					active
					size="small"
					style={{ width: 200, height: 16 }}
				/>
			</div>
			<Row gutter={[24, 24]} justify="center">
				{skeletonKeys.map((key) => (
					<Col key={key} xs={24} sm={12} lg={8} xl={6}>
						<Card className="h-full">
							<Skeleton.Image
								active
								style={{ width: "100%", height: 180 }}
								className="mb-4"
							/>
							<Skeleton active paragraph={{ rows: 2 }} />
							<div className="mt-4">
								<Skeleton.Button active block />
							</div>
						</Card>
					</Col>
				))}
			</Row>
		</div>
	);
}

/**
 * 単一のイベントセクションスケルトン
 */
export function EventSectionSkeleton() {
	return <EventSkeleton count={2} />;
}
