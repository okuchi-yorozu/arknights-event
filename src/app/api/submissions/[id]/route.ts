import { initializeApp } from "firebase/app";
import {
	Timestamp,
	deleteDoc,
	doc,
	getDoc,
	getFirestore,
	updateDoc,
} from "firebase/firestore";
import { NextResponse } from "next/server";

const firebaseConfig = {
	apiKey: process.env.FIREBASE_API_KEY,
	authDomain: process.env.FIREBASE_AUTH_DOMAIN,
	projectId: process.env.FIREBASE_PROJECT_ID,
	storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;

	try {
		const body = await request.json();
		const { editKey, ...updateData } = body;

		if (!editKey) {
			return NextResponse.json(
				{ error: "Edit key is required" },
				{ status: 400 },
			);
		}

		// 既存の投稿を取得して編集キーを確認
		const docRef = doc(db, "submissions", id);
		const docSnap = await getDoc(docRef);

		if (!docSnap.exists()) {
			return NextResponse.json(
				{ error: "Submission not found" },
				{ status: 404 },
			);
		}

		const existingData = docSnap.data();
		if (existingData.editKey !== editKey) {
			return NextResponse.json({ error: "Invalid edit key" }, { status: 403 });
		}

		// 編集期限の確認（30日）
		const submissionCreatedAt = existingData.createdAt as Timestamp;
		const now = Timestamp.now();
		const daysDiff =
			(now.seconds - submissionCreatedAt.seconds) / (24 * 60 * 60);

		if (daysDiff > 30) {
			return NextResponse.json(
				{ error: "編集期限（30日）を過ぎています" },
				{ status: 403 },
			);
		}

		// データを更新（editKeyとidとcreatedAtは除外）
		const { id: _, editKey: __, createdAt, ...dataToUpdate } = updateData;
		await updateDoc(docRef, dataToUpdate);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error updating submission:", error);
		return NextResponse.json(
			{ error: "Failed to update submission" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;

	try {
		await deleteDoc(doc(db, "submissions", id));
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting submission:", error);
		return NextResponse.json(
			{ error: "Failed to delete submission" },
			{ status: 500 },
		);
	}
}
