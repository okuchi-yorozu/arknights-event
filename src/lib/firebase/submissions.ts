import { Submission } from '@/types/submission';
import { Timestamp, addDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';

import { db } from './config';

const COLLECTION_NAME = 'submissions';

export const createSubmission = async (data: Omit<Submission, 'id' | 'createdAt'>) => {
  console.log({ data });
  try {
    const submissionData = {
      ...data,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), submissionData);
    return {
      id: docRef.id,
      ...data,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('Error creating submission:', error);
    throw error;
  }
};

export const getSubmissions = async (): Promise<Submission[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp).toDate(),
      } as Submission;
    });
  } catch (error) {
    console.error('Error getting submissions:', error);
    throw error;
  }
};
