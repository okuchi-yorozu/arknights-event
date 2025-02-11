import type { Submission } from '@/types/submission';

export const createSubmission = async (data: Omit<Submission, 'id' | 'createdAt'>) => {
  try {
    const response = await fetch('/api/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create submission');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating submission:', error);
    throw error;
  }
};

export const getSubmissions = async (): Promise<Submission[]> => {
  try {
    const response = await fetch('/api/submissions');
    if (!response.ok) {
      throw new Error('Failed to get submissions');
    }

    const submissions = await response.json();
    return submissions.map((submission: any) => ({
      ...submission,
      createdAt: new Date(submission.createdAt),
    }));
  } catch (error) {
    console.error('Error getting submissions:', error);
    throw error;
  }
};
