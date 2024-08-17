'use server';

import { headers } from 'next/headers';

export async function getIPAddress(): Promise<string> {
  const headersList = headers();
  const forwardedFor = headersList.get('x-forwarded-for');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  return headersList.get('x-real-ip') || headersList.get('x-client-ip') || 'IP not available';
}
