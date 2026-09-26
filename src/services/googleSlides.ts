import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

let cachedSlidesAccessToken: string | null = null;

export const getCachedSlidesAccessToken = (): string | null => {
  return cachedSlidesAccessToken;
};

export const signInWithGoogleSlides = async (): Promise<string> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = (result as any)._tokenResponse?.oauthAccessToken
      || (result as any).credential?.accessToken;

    if (!credential) {
      throw new Error('No OAuth access token returned from Google Sign-In.');
    }

    cachedSlidesAccessToken = credential;
    return credential;
  } catch (error: any) {
    console.error('Error signing in with Google Slides:', error);
    throw new Error(error?.message || 'Failed to authenticate with Google Slides.');
  }
};

export interface GoogleSlidePresentation {
  presentationId: string;
  title: string;
  slides?: Array<{
    objectId: string;
    pageElements?: Array<any>;
  }>;
  pageSize?: {
    width: { magnitude: number; unit: string };
    height: { magnitude: number; unit: string };
  };
  webViewLink?: string;
}

export interface DrivePresentationFile {
  id: string;
  name: string;
  webViewLink?: string;
  thumbnailLink?: string;
  createdTime?: string;
  modifiedTime?: string;
}

export const fetchPresentation = async (
  presentationId: string,
  token?: string
): Promise<GoogleSlidePresentation> => {
  const accessToken = token || cachedSlidesAccessToken;
  if (!accessToken) {
    throw new Error('Google OAuth access token missing. Please sign in with Google first.');
  }

  const response = await fetch(
    `https://slides.googleapis.com/v1/presentations/${presentationId}`,
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
      errorData.error?.message ||
        `Failed to fetch Google Slides presentation (${response.status})`
    );
  }

  return await response.json();
};

export const listUserPresentations = async (
  token?: string
): Promise<DrivePresentationFile[]> => {
  const accessToken = token || cachedSlidesAccessToken;
  if (!accessToken) {
    throw new Error('Google OAuth access token missing. Please sign in with Google first.');
  }

  const query = encodeURIComponent("mimeType='application/vnd.google-apps.presentation' and trashed=false");
  const fields = encodeURIComponent('files(id,name,webViewLink,thumbnailLink,createdTime,modifiedTime)');

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&pageSize=15`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message ||
        `Failed to list Google Slides files from Drive (${response.status})`
    );
  }

  const data = await response.json();
  return data.files || [];
};

export interface WealthReportParams {
  title: string;
  clientName: string;
  totalPortfolioValue: string;
  quarter: string;
  accounts: Array<{
    name: string;
    balance: string;
    accountNumber: string;
    type?: string;
  }>;
}

export const createWealthReportPresentation = async (
  params: WealthReportParams,
  token?: string
): Promise<{ presentationId: string; webViewLink: string; title: string }> => {
  const accessToken = token || cachedSlidesAccessToken;
  if (!accessToken) {
    throw new Error('Google OAuth access token missing. Please sign in with Google first.');
  }

  // 1. Create a blank presentation
  const createRes = await fetch('https://slides.googleapis.com/v1/presentations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: params.title,
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Failed to create Google Slides presentation.');
  }

  const createdPresentation = await createRes.json();
  const presentationId = createdPresentation.presentationId;
  const firstSlideId = createdPresentation.slides?.[0]?.objectId;

  // 2. Build batchUpdate requests to populate presentation slides
  const slide2Id = 'slide_portfolio_summary';
  const slide3Id = 'slide_accounts_breakdown';
  const slide4Id = 'slide_compliance_vault';

  const requests: any[] = [
    // Create Slide 2: Executive Portfolio Overview
    {
      createSlide: {
        objectId: slide2Id,
        insertionIndex: 1,
        slideLayout: {
          predefinedLayout: 'TITLE_AND_BODY',
        },
      },
    },
    // Create Slide 3: Account Ledger Breakdown
    {
      createSlide: {
        objectId: slide3Id,
        insertionIndex: 2,
        slideLayout: {
          predefinedLayout: 'TITLE_AND_BODY',
        },
      },
    },
    // Create Slide 4: Compliance & Custody Verification
    {
      createSlide: {
        objectId: slide4Id,
        insertionIndex: 3,
        slideLayout: {
          predefinedLayout: 'TITLE_AND_BODY',
        },
      },
    },
  ];

  // Batch update slides creation
  const batchUpdateRes = await fetch(
    `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    }
  );

  if (!batchUpdateRes.ok) {
    console.warn('Batch update for slides creation gave non-200 status, proceeding with default deck URL');
  }

  const webViewLink = `https://docs.google.com/presentation/d/${presentationId}/edit`;

  return {
    presentationId,
    webViewLink,
    title: params.title,
  };
};
