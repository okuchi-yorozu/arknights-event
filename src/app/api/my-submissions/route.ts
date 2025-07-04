import { initializeApp } from "firebase/app";
import {
	collection,
	getDocs,
	getFirestore,
	query,
	where,
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

export async function POST(request: Request) {
	try {
		const { editKey } = await request.json();

		if (!editKey) {
			return NextResponse.json(
				{ error: "Edit key is required" },
				{ status: 400 },
			);
		}

		const q = query(
			collection(db, "submissions"),
			where("editKey", "==", editKey),
		);

		const snapshot = await getDocs(q);

		if (snapshot.empty) {
			return NextResponse.json(
				{ error: "Submission not found" },
				{ status: 404 },
			);
		}

		const submission = {
			id: snapshot.docs[0].id,
			...snapshot.docs[0].data(),
			createdAt: snapshot.docs[0].data().createdAt.toDate(),
		};

		return NextResponse.json(submission);
	} catch (error) {
		console.error("Error getting submission:", error);
		return NextResponse.json(
			{ error: "Failed to get submission" },
			{ status: 500 },
		);
	}
}
