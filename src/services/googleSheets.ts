import { googleProvider, auth } from './firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// Add Google Sheets Readonly Scope to GoogleAuthProvider
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');

let cachedAccessToken: string | null = null;

export const signInWithGoogleSheets = async (): Promise<string> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
      return cachedAccessToken;
    }
    throw new Error('Access token not returned from Google sign in');
  } catch (error) {
    console.error('Error signing in with Google for Sheets:', error);
    throw error;
  }
};

export const getCachedSheetsAccessToken = (): string | null => {
  return cachedAccessToken;
};

export interface GoogleSpreadsheetData {
  spreadsheetId: string;
  title: string;
  sheets: { title: string; sheetId: number }[];
}

export const fetchSpreadsheetMetadata = async (spreadsheetId: string, token: string): Promise<GoogleSpreadsheetData> => {
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,properties.title,sheets.properties`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to fetch Google Spreadsheet details');
  }

  const data = await response.json();
  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || 'Google Sheet',
    sheets: (data.sheets || []).map((s: any) => ({
      title: s.properties?.title || 'Sheet1',
      sheetId: s.properties?.sheetId || 0
    }))
  };
};

export const fetchSheetValues = async (spreadsheetId: string, range: string, token: string): Promise<string[][]> => {
  const encodedRange = encodeURIComponent(range);
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to fetch Google Sheet values');
  }

  const data = await response.json();
  return data.values || [];
};
