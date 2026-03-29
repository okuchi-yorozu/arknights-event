import { adminAuth, adminDb } from "@/lib/firebase/admin";

import { NextResponse } from "next/server";

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;

	try {
		const body = await request.json();
		const { idToken, ...updateData } = body;

		if (!idToken) {
			return NextResponse.json(
				{ error: "認証トークンが必要です" },
				{ status: 401 },
			);
		}

		const decoded = await adminAuth.verifyIdToken(idToken);
		const uid = decoded.uid;

		const docRef = adminDb.collection("submissions").doc(id);
		const docSnap = await docRef.get();

		if (!docSnap.exists) {
			return NextResponse.json(
				{ error: "Submission not found" },
				{ status: 404 },
			);
		}

		const existingData = docSnap.data();
		if (existingData?.uid !== uid) {
			return NextResponse.json({ error: "権限がありません" }, { status: 403 });
		}

		// 編集期限の確認（30日）
		const submissionCreatedAt = existingData.createdAt?.toDate() as Date;
		const daysDiff =
			(Date.now() - submissionCreatedAt.getTime()) / (1000 * 60 * 60 * 24);

		if (daysDiff > 30) {
			return NextResponse.json(
				{ error: "編集期限（30日）を過ぎています" },
				{ status: 403 },
			);
		}

		const { id: _, uid: __, createdAt, ...dataToUpdate } = updateData;
		await docRef.update(dataToUpdate);

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
		const body = await request.json().catch(() => ({}));
		const { idToken } = body as { idToken?: string };

		const cookieHeader = request.headers.get("cookie") ?? "";
		const adminSession = cookieHeader
			.split(";")
			.map((c) => c.trim())
			.find((c) => c.startsWith("admin_session="))
			?.split("=")[1];

		const docRef = adminDb.collection("submissions").doc(id);
		const docSnap = await docRef.get();

		if (!docSnap.exists) {
			return NextResponse.json(
				{ error: "Submission not found" },
				{ status: 404 },
			);
		}

		if (adminSession) {
			// 管理者は誰の投稿でも削除可能
			await adminAuth.verifySessionCookie(adminSession, true);
		} else if (idToken) {
			// 投稿者は自分の投稿のみ削除可能
			const decoded = await adminAuth.verifyIdToken(idToken);
			if (docSnap.data()?.uid !== decoded.uid) {
				return NextResponse.json(
					{ error: "権限がありません" },
					{ status: 403 },
				);
			}
		} else {
			return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
		}

		await docRef.delete();
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting submission:", error);
		return NextResponse.json(
			{ error: "Failed to delete submission" },
			{ status: 500 },
		);
	}
}
