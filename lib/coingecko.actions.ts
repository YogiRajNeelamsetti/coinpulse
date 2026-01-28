'use server';

import qs from 'query-string';

const BASE_URL = process.env.COINGECKO_BASE_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

if (!BASE_URL) {
  throw new Error('could not find COINGECKO_BASE_URL in environment variables');
}

if (!API_KEY) {
  throw new Error('could not find COINGECKO_API_KEY in environment variables');
}

export async function fetcher<T>(
  endpoint: string,
  params?: QueryParams,
  revalidate = 60
): Promise<T> {
  const url = qs.stringifyUrl(
    {
      url: `${BASE_URL}${endpoint}`,
      query: params,
    },
    { skipEmptyString: true, skipNull: true }
  );

  const response = await fetch(url, {
    headers: {
      'x-cg-demo-api-key': API_KEY,
      'content-type': 'application/json',
    } as Record<string, string>,
    next: {
      revalidate,
    },
  });

  if (!response.ok) {
    const errorBody: CoinGeckoErrorBody = await response.json().catch(() => ({}));

    throw new Error(
      `CoinGecko API error: ${response.status}: ${errorBody.error || response.statusText}`
    );
  }

  return response.json();
}
