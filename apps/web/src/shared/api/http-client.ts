import axios, { AxiosError } from 'axios';

import { PRODUCTS_API_BASE_URL } from '../config/env';

const httpClient = axios.create({
  baseURL: PRODUCTS_API_BASE_URL,
});

export async function getRequest<T>(path: string): Promise<T> {
  try {
    const response = await httpClient.get<T>(path);

    return response.data;
  } catch (error: unknown) {
    throw toRequestError(error);
  }
}

export async function postRequest<TResponse, TBody>(path: string, body: TBody): Promise<TResponse> {
  try {
    const response = await httpClient.post<TResponse>(path, body);

    return response.data;
  } catch (error: unknown) {
    throw toRequestError(error);
  }
}

export async function deleteRequest(path: string): Promise<void> {
  try {
    await httpClient.delete(path);
  } catch (error: unknown) {
    throw toRequestError(error);
  }
}

function toRequestError(error: unknown): Error {
  if (error instanceof AxiosError) {
    return new Error(extractErrorMessage(error.response?.data, error.message));
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('Request failed');
}

function extractErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === 'string' && data.length > 0) {
    return data;
  }

  if (isRecord(data)) {
    const message = data.message;

    if (typeof message === 'string' && message.length > 0) {
      return message;
    }

    if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
      return message.join(', ');
    }
  }

  return fallback || 'Request failed';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
