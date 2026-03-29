import { adminAuth, adminDb } from "@/lib/firebase/admin";

import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const { idToken } = await request.json();

		if (!idToken) {
			return NextResponse.json(
				{ error: "認証トークンが必要です" },
				{ status: 401 },
			);
		}

		const decoded = await adminAuth.verifyIdToken(idToken);
		const uid = decoded.uid;

		const snapshot = await adminDb
			.collection("submissions")
			.where("uid", "==", uid)
			.orderBy("createdAt", "desc")
			.get();

		const submissions = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
			createdAt: doc.data().createdAt?.toDate() ?? new Date(),
		}));

		return NextResponse.json(submissions);
	} catch (error) {
		console.error("Error getting submission:", error);
		return NextResponse.json(
			{ error: "Failed to get submission" },
			{ status: 500 },
		);
	}
}
