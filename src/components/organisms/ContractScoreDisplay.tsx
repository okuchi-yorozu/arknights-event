import type React from "react";

interface ContractScoreDisplayProps {
	sixStarCount: number;
	teamSize: number;
	fiveStarCheckedCount: number;
}

const ContractScoreDisplay: React.FC<ContractScoreDisplayProps> = ({
	sixStarCount,
	teamSize,
	fiveStarCheckedCount,
}) => {
	const maxScore = 13 * 3 + 13 * 5 + 12;
	const totalScore =
		(13 - sixStarCount) * 3 + (13 - teamSize) * 5 + fiveStarCheckedCount;

	return (
		<div className="mt-4">
			<p className="text-lg">
				総合点: {totalScore} / {maxScore}
			</p>
		</div>
	);
};

export default ContractScoreDisplay;
