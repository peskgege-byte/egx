export type EgxStatus = 
  | 'connected' 
  | 'pending_key' 
  | 'unauthorized' 
  | 'rate_limited' 
  | 'provider_error' 
  | 'stale' 
  | 'insufficient_data';

export interface EgxBar {
  symbol: string;
  timeframe: string;
  capturedAt: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface EgxResponse {
  status: EgxStatus;
  data?: EgxBar[];
  source: string;
  capturedAt: string;
  error?: string;
}

export async function fetchBars(
  symbol: string,
  timeframe: '1Min' | '5Min' | '1Day' = '1Day',
  limit: number = 100
): Promise<EgxResponse> {
  const apiKey = process.env.EGXAPI_KEY;
  const baseUrl = process.env.EGXAPI_BASE_URL || 'https://api.egxapi.com';

  if (!apiKey) {
    return {
      status: 'pending_key',
      data: [],
      source: 'EGXAPI',
      capturedAt: new Date().toISOString(),
      error: 'EGXAPI_KEY not configured.',
    };
  }

  try {
    const url = new URL(`${baseUrl}/v2/market-data/bars`);
    url.searchParams.append('symbol', symbol);
    url.searchParams.append('timeframe', timeframe);
    url.searchParams.append('limit', String(limit));

    const response = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10000),
    });

    if (response.status === 401 || response.status === 403) {
      return { status: 'unauthorized', data: [], source: 'EGXAPI', capturedAt: new Date().toISOString() };
    }
    if (response.status === 429) {
      return { status: 'rate_limited', data: [], source: 'EGXAPI', capturedAt: new Date().toISOString() };
    }
    if (!response.ok) {
      return { status: 'provider_error', data: [], source: 'EGXAPI', capturedAt: new Date().toISOString() };
    }

    const json = await response.json();
    const bars = json.bars || json.data || [];

    if (!bars.length) {
      return { status: 'insufficient_data', data: [], source: 'EGXAPI', capturedAt: new Date().toISOString() };
    }

    return {
      status: 'connected',
      data: bars.map((b: any) => ({ ...b, symbol, timeframe, capturedAt: new Date().toISOString() })),
      source: 'EGXAPI',
      capturedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'provider_error',
      data: [],
      source: 'EGXAPI',
      capturedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Network or parse error',
    };
  }
}
