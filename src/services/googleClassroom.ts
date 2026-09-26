import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

let cachedClassroomAccessToken: string | null = null;

export const getCachedClassroomAccessToken = (): string | null => {
  return cachedClassroomAccessToken;
};

export const signInWithGoogleClassroom = async (): Promise<string> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = (result as any)._tokenResponse?.oauthAccessToken
      || (result as any).credential?.accessToken;

    if (!credential) {
      throw new Error('No OAuth access token returned from Google Sign-In.');
    }

    cachedClassroomAccessToken = credential;
    return credential;
  } catch (error: any) {
    console.error('Error signing in with Google Classroom:', error);
    throw new Error(error?.message || 'Failed to authenticate with Google Classroom.');
  }
};

export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  description?: string;
  room?: string;
  ownerId?: string;
  creationTime?: string;
  courseState?: string;
  alternateLink?: string;
  teacherGroupEmail?: string;
  courseGroupEmail?: string;
}

export interface CourseWorkItem {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  state?: string;
  alternateLink?: string;
  creationTime?: string;
  workType?: string;
  maxPoints?: number;
}

export const listCourses = async (token?: string): Promise<ClassroomCourse[]> => {
  const accessToken = token || cachedClassroomAccessToken;
  if (!accessToken) {
    throw new Error('Google OAuth access token missing. Please sign in with Google first.');
  }

  const response = await fetch('https://classroom.googleapis.com/v1/courses?pageSize=20', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to fetch Google Classroom courses (${response.status})`
    );
  }

  const data = await response.json();
  return data.courses || [];
};

export const listCourseWork = async (
  courseId: string,
  token?: string
): Promise<CourseWorkItem[]> => {
  const accessToken = token || cachedClassroomAccessToken;
  if (!accessToken) {
    throw new Error('Google OAuth access token missing. Please sign in with Google first.');
  }

  const response = await fetch(
    `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to fetch coursework for course (${response.status})`
    );
  }

  const data = await response.json();
  return data.courseWork || [];
};

export const createFinancialCourse = async (
  params: {
    name: string;
    section?: string;
    descriptionHeading?: string;
    description?: string;
  },
  token?: string
): Promise<ClassroomCourse> => {
  const accessToken = token || cachedClassroomAccessToken;
  if (!accessToken) {
    throw new Error('Google OAuth access token missing. Please sign in with Google first.');
  }

  const response = await fetch('https://classroom.googleapis.com/v1/courses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: params.name,
      section: params.section || 'Northern Trust Wealth Academy',
      descriptionHeading: params.descriptionHeading || 'Institutional Financial Literacy & Portfolio Management',
      description: params.description || 'Sovereign wealth curriculum covering treasury sweeps, multi-currency hedging, tax strategy, and ESG investing.',
      courseState: 'ACTIVE',
      ownerId: 'me',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to create course in Google Classroom (${response.status})`
    );
  }

  return await response.json();
};

export const createAssignmentInCourse = async (
  courseId: string,
  assignment: {
    title: string;
    description?: string;
    maxPoints?: number;
    workType?: string;
  },
  token?: string
): Promise<CourseWorkItem> => {
  const accessToken = token || cachedClassroomAccessToken;
  if (!accessToken) {
    throw new Error('Google OAuth access token missing. Please sign in with Google first.');
  }

  const response = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: assignment.title,
      description: assignment.description || '',
      maxPoints: assignment.maxPoints || 100,
      workType: assignment.workType || 'ASSIGNMENT',
      state: 'PUBLISHED',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to create assignment in Classroom (${response.status})`
    );
  }

  return await response.json();
};
