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
 * イベント設定
 */
export interface EventConfig {
	id: string;
	title: string;
	deadline: string | null;
	thumbnailUrl: string;
	stages: EventStage[];
	defaultStage: string;
	active: boolean;
}

/**
 * 処理済みイベント（ランタイムで計算される追加プロパティを含む）
 */
export interface ProcessedEvent extends EventConfig {
	path: string;
	hasDeadline: boolean;
	isActive: boolean;
}

/**
 * イベント一覧（カテゴリ別）
 */
export interface CategorizedEvents {
	active: ProcessedEvent[];
	past: ProcessedEvent[];
}
