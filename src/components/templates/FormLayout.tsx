import type { ReactNode } from "react";

import { Card, Typography } from "antd";

const { Title } = Typography;

interface FormLayoutProps {
	children: ReactNode;
	title: string;
}

export const FormLayout = ({ children, title }: FormLayoutProps) => {
	return (
		<main className="min-h-screen py-12 px-4 sm:px-8">
			<div className="max-w-2xl mx-auto">
				<Card bordered={false} className="shadow-lg">
					<Title level={2} className="text-center mb-8">
						{title}
					</Title>
					{children}
				</Card>
			</div>
		</main>
	);
};
