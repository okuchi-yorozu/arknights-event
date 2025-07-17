import { getSubmissions } from "@/lib/firebase/submissions";
import type { Submission } from "@/types/submission";
/**
 * 投稿データを管理するカスタムフック
 */
import { useCallback, useEffect, useState } from "react";

/**
 * 投稿データの状態
 */
interface UseSubmissionsState {
	submissions: Submission[];
	loading: boolean;
	error: string | null;
}

/**
 * 投稿データの操作メソッド
 */
interface UseSubmissionsActions {
	refetch: () => Promise<void>;
	addOptimisticSubmission: (submission: Submission) => void;
	removeOptimisticSubmission: (id: string) => void;
}

/**
 * useSubmissions の戻り値
 */
type UseSubmissionsReturn = UseSubmissionsState & UseSubmissionsActions;

/**
 * 投稿データを管理するフック
 * @param eventId - 特定のイベントIDでフィルタリング（省略可）
 * @returns 投稿データとその操作メソッド
 */
export function useSubmissions(eventId?: string): UseSubmissionsReturn {
	const [submissions, setSubmissions] = useState<Submission[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	/**
	 * データを再取得する
	 */
	const refetch = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await getSubmissions();

			const filtered = eventId
				? data.filter((submission) => {
						const stagePrefix = submission.stage.split("-")[0];
						return stagePrefix === eventId;
					})
				: data;

			setSubmissions(filtered);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error occurred";
			setError(errorMessage);
			console.error("Error fetching submissions:", err);
		} finally {
			setLoading(false);
		}
	}, [eventId]);

	/**
	 * 楽観的更新：投稿を追加
	 */
	const addOptimisticSubmission = useCallback((submission: Submission) => {
		setSubmissions((prev) => [submission, ...prev]);
	}, []);

	/**
	 * 楽観的更新：投稿を削除
	 */
	const removeOptimisticSubmission = useCallback((id: string) => {
		setSubmissions((prev) => prev.filter((submission) => submission.id !== id));
	}, []);

	// 初回データ取得
	useEffect(() => {
		refetch();
	}, [refetch]);

	return {
		submissions,
		loading,
		error,
		refetch,
		addOptimisticSubmission,
		removeOptimisticSubmission,
	};
}

/**
 * 投稿数のみを取得するフック（軽量版）
 * @param eventId - 特定のイベントIDでフィルタリング（省略可）
 * @returns 投稿数と読み込み状態
 */
export function useSubmissionCount(eventId?: string) {
	const [count, setCount] = useState<number>(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchCount = async () => {
			try {
				setLoading(true);
				setError(null);
				const data = await getSubmissions();

				const filtered = eventId
					? data.filter((submission) => {
							const stagePrefix = submission.stage.split("-")[0];
							return stagePrefix === eventId;
						})
					: data;

				setCount(filtered.length);
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Unknown error occurred";
				setError(errorMessage);
			} finally {
				setLoading(false);
			}
		};

		fetchCount();
	}, [eventId]);

	return { count, loading, error };
}
