import axios, { AxiosInstance, AxiosError } from 'axios';
import { logger } from '../logger';

const RETRY_DELAYS = [1000, 2000, 4000];

export function createClient(baseURL: string, apiKey: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    timeout: 15000,
  });
  return client;
}

export async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 429 && attempt < RETRY_DELAYS.length) {
          const delay = RETRY_DELAYS[attempt];
          logger.warn({ delay, attempt }, 'Rate limited, retrying');
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        if (status && status >= 500 && status < 600 && attempt < retries - 1) {
          const delay = RETRY_DELAYS[Math.min(attempt, RETRY_DELAYS.length - 1)];
          logger.warn({ status, delay, attempt }, 'Server error, retrying');
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
      }
      throw err;
    }
  }
  throw lastError;
}

export function parseError(err: unknown): { status: number; code: string; detail: string } {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<{ errors?: Array<{ code: string; detail: string; status: string }> }>;
    const errors = axiosErr.response?.data?.errors;
    if (errors && errors.length > 0) {
      return {
        status: parseInt(errors[0].status, 10) || axiosErr.response?.status || 500,
        code: errors[0].code,
        detail: errors[0].detail,
      };
    }
    return {
      status: axiosErr.response?.status || 500,
      code: axiosErr.code || 'UNKNOWN',
      detail: axiosErr.message,
    };
  }
  return {
    status: 500,
    code: 'UNKNOWN',
    detail: err instanceof Error ? err.message : 'Unknown error',
  };
}
