/**
 * クライアントサイドFirebase Storageアップロードユーティリティ
 */

import { getApp, getApps, initializeApp } from "firebase/app";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp() {
	return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
}

/**
 * イベントサムネイル画像をFirebase Storageにアップロードして公開URLを返す
 * @param file - アップロードするファイル
 * @returns 公開ダウンロードURL
 */
export async function uploadEventThumbnail(file: File): Promise<string> {
	const app = getFirebaseApp();
	const storage = getStorage(app);
	const path = `events/thumbnails/${Date.now()}_${file.name}`;
	const storageRef = ref(storage, path);
	await uploadBytes(storageRef, file);
	const downloadUrl = await getDownloadURL(storageRef);
	return downloadUrl;
}
