import { initializeApp } from 'firebase/app';
import {
  Timestamp,
  addDoc,
  collection,
  getDocs,
  getFirestore,
  orderBy,
  query,
} from 'firebase/firestore';

import { NextResponse } from 'next/server';

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const submissionData = {
      ...body,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'submissions'), submissionData);

    return NextResponse.json({
      id: docRef.id,
      ...submissionData,
      createdAt: submissionData.createdAt.toDate(),
    });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    const submissions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    }));

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error getting submissions:', error);
    return NextResponse.json({ error: 'Failed to get submissions' }, { status: 500 });
  }
}
