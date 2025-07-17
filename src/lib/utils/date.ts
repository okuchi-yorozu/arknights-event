/**
 * 日付関連のユーティリティ関数
 * 日本の日付形式（M/D）をパースし、イベントの活動状態を判定する
 */

/**
 * 日付文字列をパースして比較用の数値を返す
 * @param deadline - "3/25（火）23時〆切" 形式の文字列
 * @returns 比較用の数値（月*100 + 日）、無効な場合は0
 */
export function parseDeadline(deadline: string | null): number {
	if (!deadline) return 0;

	// "3/25（火）23時〆切" から "3/25" を抽出
	const match = deadline.match(/(\d+)\/(\d+)/);
	if (!match) return 0;

	const month = Number.parseInt(match[1], 10);
	const day = Number.parseInt(match[2], 10);

	// 月と日を使って比較用の値を作成（月 * 100 + 日）
	return month * 100 + day;
}

/**
 * 現在日付を取得して比較用の数値を返す
 * @returns 比較用の数値（月*100 + 日）
 */
export function getCurrentDate(): number {
	const now = new Date();
	const month = now.getMonth() + 1; // 0から始まるため+1
	const day = now.getDate();
	return month * 100 + day;
}

/**
 * 締切日が現在日付より後かどうかを判定する
 * @param deadline - 締切日の文字列
 * @returns イベントが現在進行中かどうか
 */
export function isEventActive(deadline: string | null): boolean {
	if (!deadline) return false;
	const currentDate = getCurrentDate();
	const deadlineDate = parseDeadline(deadline);
	return deadlineDate >= currentDate;
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
	parseDeadline,
	getCurrentDate,
	isEventActive,
	formatJapaneseDate,
} as const;
