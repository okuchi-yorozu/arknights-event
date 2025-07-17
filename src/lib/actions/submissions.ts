"use server";

import { initializeApp } from "firebase/app";
import {
	Timestamp,
	addDoc,
	collection,
	getDocs,
	getFirestore,
	orderBy,
	query,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import type { Submission } from "@/types/submission";

const firebaseConfig = {
	apiKey: process.env.FIREBASE_API_KEY,
	authDomain: process.env.FIREBASE_AUTH_DOMAIN,
	projectId: process.env.FIREBASE_PROJECT_ID,
	storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.FIREBASE_APP_ID,
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface SubmissionFormState {
	success: boolean;
	error?: string;
	submission?: Submission;
}

type FormData = Omit<Submission, "id" | "createdAt" | "editKey">;

export async function createSubmissionAction(
	prevState: SubmissionFormState,
	formData: FormData,
): Promise<SubmissionFormState> {
	try {
		// 編集用のキーを生成
		const editKey = uuidv4();

		// 投稿データに編集キーを追加
		const submissionData = {
			...formData,
			editKey,
			createdAt: Timestamp.now(),
		};

		const docRef = await addDoc(collection(db, "submissions"), submissionData);

		const submission: Submission = {
			id: docRef.id,
			...formData,
			editKey,
			createdAt: submissionData.createdAt.toDate(),
		};

		return {
			success: true,
			submission,
		};
	} catch (error) {
		console.error("Error creating submission:", error);
		return {
			success: false,
			error: "応募の作成中にエラーが発生しました。もう一度お試しください。",
		};
	}
}

export async function getSubmissionsAction(): Promise<Submission[]> {
	try {
		const q = query(
			collection(db, "submissions"),
			orderBy("createdAt", "desc"),
		);

		const snapshot = await getDocs(q);
		const submissions = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
			createdAt: doc.data().createdAt.toDate(),
		})) as Submission[];

		return submissions;
	} catch (error) {
		console.error("Error getting submissions:", error);
		throw new Error("投稿の取得中にエラーが発生しました。");
	}
}