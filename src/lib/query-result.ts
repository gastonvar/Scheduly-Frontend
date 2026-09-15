import { getErrorMessage } from '@/lib/api-error';

export function queryErrorMessage(error: unknown): string | null {
  return error ? getErrorMessage(error) : null;
}
