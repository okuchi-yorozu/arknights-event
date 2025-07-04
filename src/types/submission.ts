export interface Submission {
	id?: string;
	editKey?: string;
	youtubeUrl: string;
	concept: string;
	hasEditing: "edited" | "raw";
	stage: string;
	difficulty: "normal" | "challenge";
	twitterHandle?: string;
	doctorHistory:
		| "less-than-6months"
		| "6months-1year"
		| "1-2years"
		| "2-3years"
		| "more-than-3years";
	introduction?: string;
	createdAt: Date;
}
