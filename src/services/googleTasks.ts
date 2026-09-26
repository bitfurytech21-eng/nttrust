import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

let cachedTasksAccessToken: string | null = null;

export const getCachedTasksAccessToken = (): string | null => {
  return cachedTasksAccessToken;
};

export const signInWithGoogleTasks = async (): Promise<string> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = (result as any)._tokenResponse?.oauthAccessToken
      || (result as any).credential?.accessToken;

    if (!credential) {
      throw new Error('No OAuth access token returned from Google Sign-In.');
    }

    cachedTasksAccessToken = credential;
    return credential;
  } catch (error: any) {
    console.error('Error signing in with Google Tasks:', error);
    throw new Error(error?.message || 'Failed to authenticate with Google Tasks.');
  }
};

export interface GoogleTaskList {
  id: string;
  title: string;
  updated?: string;
  selfLink?: string;
}

export interface GoogleTaskItem {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  completed?: string;
  updated?: string;
}

export const listTaskLists = async (token?: string): Promise<GoogleTaskList[]> => {
  const accessToken = token || cachedTasksAccessToken;
  if (!accessToken) {
    throw new Error('Google OAuth access token missing. Please sign in with Google first.');
  }

  const response = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to fetch task lists from Google Tasks (${response.status})`
    );
  }

  const data = await response.json();
  return data.items || [];
};

export const listTasks = async (
  taskListId: string = '@default',
  token?: string
): Promise<GoogleTaskItem[]> => {
  const accessToken = token || cachedTasksAccessToken;
  if (!accessToken) {
    throw new Error('Google OAuth access token missing. Please sign in with Google first.');
  }

  const response = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks?showCompleted=true&showHidden=true`,
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
      errorData.error?.message || `Failed to fetch tasks for list (${response.status})`
    );
  }

  const data = await response.json();
  return data.items || [];
};

export const createTask = async (
  taskListId: string = '@default',
  task: {
    title: string;
    notes?: string;
    due?: string;
  },
  token?: string
): Promise<GoogleTaskItem> => {
  const accessToken = token || cachedTasksAccessToken;
  if (!accessToken) {
    throw new Error('Google OAuth access token missing. Please sign in with Google first.');
  }

  const response = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: task.title,
      notes: task.notes || '',
      due: task.due || undefined,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to create task in Google Tasks (${response.status})`
    );
  }

  return await response.json();
};

export const toggleTaskStatus = async (
  taskListId: string = '@default',
  taskId: string,
  completed: boolean,
  token?: string
): Promise<GoogleTaskItem> => {
  const accessToken = token || cachedTasksAccessToken;
  if (!accessToken) {
    throw new Error('Google OAuth access token missing. Please sign in with Google first.');
  }

  const response = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: completed ? 'completed' : 'needsAction',
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to update task status (${response.status})`
    );
  }

  return await response.json();
};

export const deleteTask = async (
  taskListId: string = '@default',
  taskId: string,
  token?: string
): Promise<void> => {
  const accessToken = token || cachedTasksAccessToken;
  if (!accessToken) {
    throw new Error('Google OAuth access token missing. Please sign in with Google first.');
  }

  const response = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to delete task (${response.status})`
    );
  }
};
