'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const API_BASE = 'https://api.coingecko.com/api/v3';
const API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
const PRICE_POLL_INTERVAL = 60000; // 60 seconds - matches cache/update frequency for public API
const TRADES_POLL_INTERVAL = 60000; // 60 seconds - matches cache/update frequency for onchain trades
const RATE_LIMIT_PAUSE = 60000; // 60 seconds pause on 429

interface CoinGeckoSimplePriceResponse {
  [coinId: string]: {
    usd: number;
    usd_24h_change?: number;
    usd_market_cap?: number;
    usd_24h_vol?: number;
    last_updated_at?: number;
  };
}

// Onchain trades response from /onchain/networks/{network}/pools/{pool_address}/trades
interface OnchainTradesResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      block_number: number;
      tx_hash: string;
      tx_from_address: string;
      from_token_amount: string;
      to_token_amount: string;
      price_from_in_usd: string;
      price_to_in_usd: string;
      block_timestamp: string;
      kind: 'buy' | 'sell';
      volume_in_usd: string;
    };
  }[];
}

/**
 * Transforms CoinGecko REST API response to match the WebSocket ExtendedPriceData format
 */
const transformPriceData = (
  coinId: string,
  data: CoinGeckoSimplePriceResponse
): ExtendedPriceData | null => {
  const coinData = data[coinId];
  if (!coinData) return null;

  return {
    usd: coinData.usd ?? 0,
    coin: coinId,
    price: coinData.usd,
    change24h: coinData.usd_24h_change,
    marketCap: coinData.usd_market_cap,
    volume24h: coinData.usd_24h_vol,
    timestamp: coinData.last_updated_at ? coinData.last_updated_at * 1000 : Date.now(),
  };
};

/**
 * Transforms onchain trades data to Trade format
 * Uses real DEX trade data from the onchain API
 */
const transformOnchainTrades = (data: OnchainTradesResponse): Trade[] => {
  return data.data.slice(0, 7).map((trade) => ({
    price: parseFloat(trade.attributes.price_from_in_usd),
    value: parseFloat(trade.attributes.volume_in_usd),
    timestamp: new Date(trade.attributes.block_timestamp).getTime(),
    type: trade.attributes.kind, // 'buy' or 'sell' from actual trade data
    amount: parseFloat(trade.attributes.from_token_amount),
  }));
};

/**
 * Parses poolId format "network_poolAddress" or "network:poolAddress"
 * Returns { network, poolAddress } or null if invalid
 */
const parsePoolId = (poolId: string): { network: string; poolAddress: string } | null => {
  if (!poolId) return null;

  // Handle both formats: "eth_0x123..." and "eth:0x123..."
  const separator = poolId.includes(':') ? ':' : '_';
  const parts = poolId.split(separator);

  if (parts.length !== 2) return null;

  const [network, poolAddress] = parts;
  if (!network || !poolAddress) return null;

  return { network, poolAddress };
};

/**
 * useSimulatedWebSocket - A polling-based hook that simulates WebSocket behavior
 * using the CoinGecko Demo API (Free Tier).
 *
 * Uses these endpoints:
 * - /simple/price - For real-time price data (60s cache)
 * - /onchain/networks/{network}/pools/{pool_address}/ohlcv/{timeframe} - For OHLCV candle data (60s cache)
 * - /onchain/networks/{network}/pools/{pool_address}/trades - For real DEX trade data (60s cache)
 *
 * Maintains the exact same interface as useCoinGeckoWebSocket for drop-in replacement.
 */
export const useSimulatedWebSocket = ({
  coinId,
  poolId,
  liveInterval,
}: UseCoinGeckoWebSocketProps): UseCoinGeckoWebSocketReturn => {
  const [price, setPrice] = useState<ExtendedPriceData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [ohlcv, setOhlcv] = useState<OHLCData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Refs for polling intervals
  const pricePollingRef = useRef<NodeJS.Timeout | null>(null);
  const tradesPollingRef = useRef<NodeJS.Timeout | null>(null);

  // Refs for tracking state without causing re-renders
  const rateLimitedRef = useRef(false);
  const isConnectedRef = useRef(false);
  const mountedRef = useRef(true);

  // Track previous values to detect actual changes
  const prevCoinIdRef = useRef<string | null>(null);
  const prevPoolIdRef = useRef<string | null>(null);

  // Track previous OHLCV for building live candle from price updates
  const liveOhlcvRef = useRef<OHLCData | null>(null);

  const getHeaders = useCallback(() => {
    const headers: HeadersInit = {
      Accept: 'application/json',
    };
    if (API_KEY) {
      headers['x-cg-demo-api-key'] = API_KEY;
    }
    return headers;
  }, []);

  /**
   * Fetches price data from /simple/price endpoint
   * Cache: 60 seconds for Public API
   */
  const fetchPriceData = useCallback(async () => {
    if (rateLimitedRef.current || !coinId || !mountedRef.current) return;

    try {
      const params = new URLSearchParams({
        ids: coinId,
        vs_currencies: 'usd',
        include_24hr_change: 'true',
        include_market_cap: 'true',
        include_24hr_vol: 'true',
        include_last_updated_at: 'true',
      });

      const response = await fetch(`${API_BASE}/simple/price?${params.toString()}`, {
        headers: getHeaders(),
      });

      if (!mountedRef.current) return;

      if (response.status === 429) {
        console.warn('[useSimulatedWebSocket] Rate limited on price. Pausing...');
        rateLimitedRef.current = true;
        setTimeout(() => {
          rateLimitedRef.current = false;
        }, RATE_LIMIT_PAUSE);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CoinGeckoSimplePriceResponse = await response.json();

      if (!mountedRef.current) return;

      const transformedPrice = transformPriceData(coinId, data);

      if (transformedPrice) {
        setPrice(transformedPrice);

        // Update live OHLCV candle with current market price
        // This ensures the chart shows the actual market price, not just DEX pool trades
        const currentPrice = transformedPrice.usd;
        const timestamp = transformedPrice.timestamp ?? Date.now();
        // Round timestamp to current minute for candle alignment
        const candleTimestamp = Math.floor(timestamp / 60000) * 60;

        const prevCandle = liveOhlcvRef.current;

        let newCandle: OHLCData;

        if (prevCandle && prevCandle[0] === candleTimestamp) {
          // Same minute - update existing candle
          newCandle = [
            candleTimestamp,
            prevCandle[1], // keep original open
            Math.max(prevCandle[2], currentPrice), // update high if needed
            Math.min(prevCandle[3], currentPrice), // update low if needed
            currentPrice, // update close to current price
          ];
        } else {
          // New minute - create new candle
          // Use previous close as open, or current price if no previous
          const open = prevCandle ? prevCandle[4] : currentPrice;
          newCandle = [
            candleTimestamp,
            open,
            Math.max(open, currentPrice),
            Math.min(open, currentPrice),
            currentPrice,
          ];
        }

        liveOhlcvRef.current = newCandle;
        setOhlcv(newCandle);

        if (!isConnectedRef.current) {
          isConnectedRef.current = true;
          setIsConnected(true);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      console.error('[useSimulatedWebSocket] Price fetch error:', error);
    }
  }, [coinId, getHeaders]);

  /**
   * Fetches trades data from /onchain/networks/{network}/pools/{pool_address}/trades endpoint
   * Cache: 60 seconds
   * Returns real DEX trade data
   */
  const fetchTradesData = useCallback(async () => {
    if (rateLimitedRef.current || !poolId || !mountedRef.current) return;

    const poolInfo = parsePoolId(poolId);
    if (!poolInfo) {
      console.warn('[useSimulatedWebSocket] Invalid poolId format:', poolId);
      return;
    }

    const { network, poolAddress } = poolInfo;

    try {
      const params = new URLSearchParams({
        trade_volume_in_usd_greater_than: '0',
      });

      const url = `${API_BASE}/onchain/networks/${network}/pools/${poolAddress}/trades?${params.toString()}`;
      const response = await fetch(url, {
        headers: getHeaders(),
      });

      if (!mountedRef.current) return;

      if (response.status === 429) {
        console.warn('[useSimulatedWebSocket] Rate limited on trades. Pausing...');
        rateLimitedRef.current = true;
        setTimeout(() => {
          rateLimitedRef.current = false;
        }, RATE_LIMIT_PAUSE);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: OnchainTradesResponse = await response.json();

      if (!mountedRef.current) return;

      if (data?.data && data.data.length > 0) {
        const transformedTrades = transformOnchainTrades(data);
        setTrades(transformedTrades);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      console.error('[useSimulatedWebSocket] Trades fetch error:', error);
    }
  }, [poolId, getHeaders]);

  // Cleanup intervals helper
  const clearAllIntervals = useCallback(() => {
    if (pricePollingRef.current) {
      clearInterval(pricePollingRef.current);
      pricePollingRef.current = null;
    }
    if (tradesPollingRef.current) {
      clearInterval(tradesPollingRef.current);
      tradesPollingRef.current = null;
    }
  }, []);

  // Effect to handle coinId/poolId changes - only reset when actually changed
  useEffect(() => {
    const coinIdChanged = prevCoinIdRef.current !== coinId;
    const poolIdChanged = prevPoolIdRef.current !== poolId;

    // Only reset state if the IDs actually changed (not on every render)
    if (coinIdChanged || poolIdChanged) {
      // Reset state only when IDs change
      setPrice(null);
      setTrades([]);
      setOhlcv(null);
      setIsConnected(false);
      isConnectedRef.current = false;
      liveOhlcvRef.current = null; // Reset live candle tracking

      // Update refs
      prevCoinIdRef.current = coinId;
      prevPoolIdRef.current = poolId;
    }
  }, [coinId, poolId]);

  // Main effect for setting up polling
  useEffect(() => {
    mountedRef.current = true;

    // Clear existing intervals
    clearAllIntervals();

    // Perform initial fetches
    // Price fetch also generates the live OHLCV candle from current market price
    fetchPriceData();

    // Only fetch trades data if poolId is provided (mimicking WebSocket behavior)
    if (poolId) {
      fetchTradesData();
    }

    // Set up polling intervals based on API cache times
    // Price polling also updates the live OHLCV candle with current market price
    pricePollingRef.current = setInterval(fetchPriceData, PRICE_POLL_INTERVAL);

    if (poolId) {
      tradesPollingRef.current = setInterval(fetchTradesData, TRADES_POLL_INTERVAL);
    }

    // Cleanup
    return () => {
      mountedRef.current = false;
      clearAllIntervals();
    };
  }, [coinId, poolId, liveInterval, fetchPriceData, fetchTradesData, clearAllIntervals]);

  return {
    price,
    trades,
    ohlcv,
    isConnected,
  };
};

export default useSimulatedWebSocket;
