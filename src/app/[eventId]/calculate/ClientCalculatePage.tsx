"use client";

import "@ant-design/v5-patch-for-react-19";

import ContractCalculator from "@/components/organisms/ContractCalculator";
import { FormLayout } from "@/components/templates";

interface ClientCalculatePageProps {
	title: string;
	fiveStarOperatorImages: string[];
}

export function ClientCalculatePage({
	title,
	fiveStarOperatorImages,
}: ClientCalculatePageProps) {
	return (
		<FormLayout title={title}>
			<ContractCalculator fiveStarOperatorImages={fiveStarOperatorImages} />
		</FormLayout>
	);
}
