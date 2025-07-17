/**
 * イベント関連の型定義
 */

/**
 * イベントステージの定義
 */
export interface EventStage {
	value: string;
	label: string;
}

/**
 * イベント計算機の設定
 */
export interface EventCalculator {
	title: string;
	fiveStarOperatorImages: string[];
}

/**
 * イベント設定（events.jsonの構造）
 */
export interface EventConfig {
	id: string;
	title: string;
	deadline: string | null;
	thumbnailUrl: string;
	stages: EventStage[];
	defaultStage: string;
	active: boolean;
	calculator?: EventCalculator | null;
}

/**
 * 処理済みイベント（ランタイムで計算される追加プロパティを含む）
 */
export interface ProcessedEvent extends EventConfig {
	path: string;
	hasDeadline: boolean;
	isActive: boolean;
	deadlineValue: number;
}

/**
 * イベント一覧（カテゴリ別）
 */
export interface CategorizedEvents {
	active: ProcessedEvent[];
	past: ProcessedEvent[];
}

/**
 * events.jsonの型定義
 */
export type EventsConfig = Record<string, EventConfig>;
