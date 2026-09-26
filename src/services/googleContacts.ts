// Google Contacts (People API) Integration Service

export interface GoogleContact {
  resourceName: string;
  name: string;
  email: string;
  phone: string;
  organization?: string;
  photoUrl?: string;
}

/**
 * Fetch contacts from Google People API using the OAuth Access Token
 */
export async function fetchGoogleContacts(accessToken: string): Promise<GoogleContact[]> {
  try {
    const url = 'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,organizations,photos&pageSize=100';
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Google People API Error:', response.status, errText);
      throw new Error(`Google Contacts request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const connections = data.connections || [];

    return connections.map((person: any) => {
      const names = person.names || [];
      const primaryName = names.find((n: any) => n.metadata?.primary) || names[0];
      const displayName = primaryName?.displayName || 'Unnamed Contact';

      const emails = person.emailAddresses || [];
      const primaryEmail = emails.find((e: any) => e.metadata?.primary) || emails[0];
      const emailValue = primaryEmail?.value || '';

      const phones = person.phoneNumbers || [];
      const primaryPhone = phones.find((p: any) => p.metadata?.primary) || phones[0];
      const phoneValue = primaryPhone?.value || '';

      const orgs = person.organizations || [];
      const primaryOrg = orgs.find((o: any) => o.metadata?.primary) || orgs[0];
      const orgValue = primaryOrg?.name || '';

      const photos = person.photos || [];
      const primaryPhoto = photos.find((pt: any) => pt.metadata?.primary) || photos[0];
      const photoUrl = primaryPhoto?.url || '';

      return {
        resourceName: person.resourceName,
        name: displayName,
        email: emailValue,
        phone: phoneValue,
        organization: orgValue,
        photoUrl,
      };
    });
  } catch (error) {
    console.error('Failed to fetch Google Contacts:', error);
    throw error;
  }
}
