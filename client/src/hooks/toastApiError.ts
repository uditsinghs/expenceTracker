import { toast } from 'sonner';
import { ApiRequestError } from '@/services/api/client';

export function toastApiError(error: unknown) {
  if (error instanceof ApiRequestError) {
    toast.error(error.message);
    return;
  }
  toast.error('Something went wrong. Please try again.');
}
