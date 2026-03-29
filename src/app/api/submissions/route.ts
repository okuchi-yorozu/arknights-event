import { adminAuth, adminDb } from "@/lib/firebase/admin";

import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { idToken, ...formData } = body;

		if (!idToken) {
			return NextResponse.json(
				{ error: "認証トークンが必要です" },
				{ status: 401 },
			);
		}

		const decoded = await adminAuth.verifyIdToken(idToken);
		const uid = decoded.uid;

		const submissionData = {
			...formData,
			uid,
			createdAt: FieldValue.serverTimestamp(),
		};

		const docRef = await adminDb.collection("submissions").add(submissionData);

		return NextResponse.json({
			id: docRef.id,
			...formData,
			uid,
			createdAt: new Date(),
		});
	} catch (error) {
		console.error("Error creating submission:", error);
		return NextResponse.json(
			{ error: "Failed to create submission" },
			{ status: 500 },
		);
	}
}

export async function GET() {
	try {
		const snapshot = await adminDb
			.collection("submissions")
			.orderBy("createdAt", "desc")
			.get();

		const submissions = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
			createdAt: doc.data().createdAt?.toDate() ?? new Date(),
		}));

		return NextResponse.json(submissions);
	} catch (error) {
		console.error("Error getting submissions:", error);
		return NextResponse.json(
			{ error: "Failed to get submissions" },
			{ status: 500 },
		);
	}
}
