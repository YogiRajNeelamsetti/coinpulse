'use server'

import qs from 'query-string';

const BASE_URL = process.env.COINGECKO_BASE_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

if(!BASE_URL) throw new Error('Could not get base url');
if(!API_KEY) throw new Error('Could not get api key');


export async function fetcher<T>(
    endpoint: string,
    params?: QueryParams,
    revalidate = 60,
): Promise<T> {
    const url = qs.stringifyUrl({
        url: `${BASE_URL}/${endpoint}`,
        query: params,
    }, { skipEmptyString: true, skipNull: true});

    const response = await fetch(url, {
        headers: {
            'x-cg-demo-api-key' : API_KEY,
            'Content-Type': "application/json",
        } as Record<string, string>,
        next: { revalidate }
    });

    if(!response.ok) {
        const errorBody: CoinGeckoErrorBody = await response.json().catch(() => ({}));

        throw new Error(`API Error: ${response.status}: ${errorBody.error || response.statusText} `);
    }

    return response.json();
}

export async function searchCoins(query: string): Promise<SearchCoin[]> {
  if (!query.trim()) return [];

  // Normalize query to lowercase for case-insensitive search
  const normalizedQuery = query.trim().toLowerCase();

  try {
    const response = await fetcher<{ coins: SearchCoinResponse[] }>('search', { query: normalizedQuery });

    if (!response.coins || response.coins.length === 0) return [];

    // Sort results: exact matches first, then by market cap rank
    const sortedCoins = [...response.coins].sort((a, b) => {
      const aSymbol = a.symbol.toLowerCase();
      const bSymbol = b.symbol.toLowerCase();
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      // Exact symbol match gets highest priority
      const aExactSymbol = aSymbol === normalizedQuery;
      const bExactSymbol = bSymbol === normalizedQuery;
      if (aExactSymbol && !bExactSymbol) return -1;
      if (!aExactSymbol && bExactSymbol) return 1;

      // Exact name match gets second priority
      const aExactName = aName === normalizedQuery;
      const bExactName = bName === normalizedQuery;
      if (aExactName && !bExactName) return -1;
      if (!aExactName && bExactName) return 1;

      // Sort by market cap rank (lower rank = higher market cap = better)
      const aRank = a.market_cap_rank ?? Infinity;
      const bRank = b.market_cap_rank ?? Infinity;
      return aRank - bRank;
    });

    // Fetch price data for the search results to get price_change_percentage_24h
    const coinIds = sortedCoins.slice(0, 10).map(coin => coin.id).join(',');
    
    if (!coinIds) return [];

    const priceData = await fetcher<Record<string, { usd: number; usd_24h_change: number }>>(
      'simple/price',
      { 
        ids: coinIds, 
        vs_currencies: 'usd', 
        include_24hr_change: 'true' 
      }
    );

    return sortedCoins.slice(0, 10).map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      market_cap_rank: coin.market_cap_rank,
      thumb: coin.thumb,
      large: coin.large,
      data: {
        price: priceData[coin.id]?.usd,
        price_change_percentage_24h: priceData[coin.id]?.usd_24h_change ?? 0,
      },
    }));
  } catch (error) {
    console.error('searchCoins error:', error);
    return [];
  }
}

export async function getPools(
  id: string,
  network?: string | null,
  contractAddress?: string | null
): Promise<PoolData> {
  const fallback: PoolData = {
    id: "",
    address: "",
    name: "",
    network: "",
  };

  if (network && contractAddress) {
    try {
      const poolData = await fetcher<{ data: PoolData[] }>(
        `onchain/networks/${network}/tokens/${contractAddress}/pools`
      );

      return poolData.data?.[0] ?? fallback;
    } catch(error) {
      console.log(error);
      return fallback;
    }
  }

  try {
    const poolData = await fetcher<{ data: PoolData[] }>(
      "onchain/search/pools",
      { query: id }
    );

    return poolData.data?.[0] ?? fallback;
  } catch {
    return fallback;
  }
}