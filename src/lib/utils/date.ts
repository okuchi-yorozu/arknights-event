/**
 * 日付関連のユーティリティ関数
 * ISO 8601 日付形式（YYYY-MM-DD）を使用して日付を管理する
 */

/**
 * 締切日が現在日付より後かどうかを判定する
 * @param deadline - "YYYY-MM-DD" 形式の締切日文字列
 * @returns イベントが現在進行中かどうか
 */
export function isEventActive(deadline: string | null): boolean {
	if (!deadline) return false;
	const [year, month, day] = deadline.split("-").map(Number);
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	return new Date(year, month - 1, day) >= today;
}

/**
 * ISO 日付文字列を日本語の締切表示形式に変換する
 * @param deadline - "YYYY-MM-DD" 形式の締切日文字列
 * @returns "M/D（曜）23時〆切" 形式の文字列、無効な場合は null
 */
export function formatDeadline(deadline: string | null): string | null {
	if (!deadline) return null;
	const [year, month, day] = deadline.split("-").map(Number);
	if (!year || !month || !day) return null;
	const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
	const weekday = weekdays[new Date(year, month - 1, day).getDay()];
	return `${month}/${day}（${weekday}）23時〆切`;
}

/**
 * 日付を日本語形式でフォーマット
 * @param date - フォーマットする日付
 * @returns "3月25日（火）" 形式の文字列
 */
export function formatJapaneseDate(date: Date): string {
	return date.toLocaleDateString("ja-JP", {
		month: "numeric",
		day: "numeric",
		weekday: "short",
	});
}

/**
 * 日付ユーティリティのオブジェクト（名前空間として使用）
 */
export const dateUtils = {
	isEventActive,
	formatDeadline,
	formatJapaneseDate,
} as const;
