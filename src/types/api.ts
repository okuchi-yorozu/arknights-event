/**
 * API関連の型定義
 */

/**
 * API レスポンスの基本構造
 */
export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
	timestamp: string;
}

/**
 * ページ分割されたレスポンス
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
	pagination: {
		page: number;
		limit: number;
		total: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

/**
 * エラーレスポンス
 */
export interface ErrorResponse {
	success: false;
	error: string;
	details?: Record<string, unknown>;
	timestamp: string;
}

/**
 * 成功レスポンス
 */
export interface SuccessResponse<T> {
	success: true;
	data: T;
	timestamp: string;
}

/**
 * フォーム送信エラー
 */
export interface FormError {
	field: string;
	message: string;
}

/**
 * バリデーションエラーレスポンス
 */
export interface ValidationErrorResponse extends ErrorResponse {
	errors: FormError[];
}
