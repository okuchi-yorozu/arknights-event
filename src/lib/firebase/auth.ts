"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

const clientConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp() {
	return getApps().length === 0 ? initializeApp(clientConfig) : getApp();
}

/**
 * Google ポップアップでサインインし、Firebase ID トークンを返す
 */
export async function signInWithGoogle(): Promise<string> {
	const auth = getAuth(getFirebaseApp());
	const provider = new GoogleAuthProvider();
	const result = await signInWithPopup(auth, provider);
	return result.user.getIdToken();
}
