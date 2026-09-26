import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

let cachedCalendarAccessToken: string | null = null;

export const getCachedCalendarAccessToken = (): string | null => {
  return cachedCalendarAccessToken;
};

export const signInWithGoogleCalendar = async (): Promise<string> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = (result as any)._tokenResponse?.oauthAccessToken
      || (result as any).credential?.accessToken;

    if (!credential) {
      throw new Error('No OAuth access token returned from Google Sign-In.');
    }

    cachedCalendarAccessToken = credential;
    return credential;
  } catch (error: any) {
    console.error('Error signing in with Google Calendar:', error);
    throw new Error(error?.message || 'Failed to authenticate with Google Calendar.');
  }
};

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
  };
  htmlLink?: string;
  status?: string;
  organizer?: {
    displayName?: string;
    email?: string;
  };
}

export const listCalendarEvents = async (
  calendarId: string = 'primary',
  token?: string
): Promise<GoogleCalendarEvent[]> => {
  const accessToken = token || cachedCalendarAccessToken;
  if (!accessToken) {
    throw new Error('Google OAuth access token missing. Please sign in with Google first.');
  }

  // Fetch upcoming events from primary calendar
  const timeMin = new Date().toISOString();
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?singleEvents=true&orderBy=startTime&timeMin=${timeMin}&maxResults=20`,
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
      errorData.error?.message || `Failed to fetch calendar events (${response.status})`
    );
  }

  const data = await response.json();
  return data.items || [];
};

export const createCalendarEvent = async (
  event: {
    summary: string;
    description?: string;
    location?: string;
    startDateTime: string; // ISO string
    endDateTime: string;   // ISO string
  },
  calendarId: string = 'primary',
  token?: string
): Promise<GoogleCalendarEvent> => {
  const accessToken = token || cachedCalendarAccessToken;
  if (!accessToken) {
    throw new Error('Google OAuth access token missing. Please sign in with Google first.');
  }

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: event.summary,
        description: event.description || '',
        location: event.location || '',
        start: { dateTime: event.startDateTime },
        end: { dateTime: event.endDateTime },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to create event in Google Calendar (${response.status})`
    );
  }

  return await response.json();
};
