// PlanRuleコンポーネント書いて
import { usePathname } from "next/navigation";

import { Typography } from "antd";

const { Title, Paragraph } = Typography;

export const EventSubmissionGuidelines = () => {
	const pathname = usePathname();

	return (
		<Typography className="mb-8">
			<Title level={4}>ルール</Title>
			<Paragraph>
				<ul>
					<li>募集した動画は、後日配信で紹介（同時視聴）させていただきます</li>
					<li>縛りなどは自由です（星5以下である必要はありません）</li>
					<li>動画は10分程度が目安です</li>
					<li>BGMは権利的に問題ないものを使ってください</li>
					<li>
						任意：みんなの編成が何点か、
						<a
							href={`${pathname}/calculate`}
							className="text-blue-500 underline"
						>
							契約計算機
						</a>
						で遊んでみてね！
					</li>
				</ul>
			</Paragraph>
		</Typography>
	);
};
