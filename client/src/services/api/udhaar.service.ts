import type { RepaymentInput, Udhaar, UdhaarInput, UdhaarStatus, UdhaarType } from '@/types';
import { http } from './client';

export type UdhaarQuery = {
  type?: UdhaarType;
  status?: UdhaarStatus;
  search?: string;
};

export const udhaarService = {
  list: (query: UdhaarQuery = {}) => http.get<Udhaar[]>('/udhaar', query),
  get: (id: string) => http.get<Udhaar>(`/udhaar/${id}`),
  create: (input: UdhaarInput) => http.post<Udhaar>('/udhaar', input),
  update: (id: string, input: Partial<UdhaarInput>) => http.put<Udhaar>(`/udhaar/${id}`, input),
  remove: (id: string) => http.delete<{ id: string }>(`/udhaar/${id}`),
  addRepayment: (id: string, input: RepaymentInput) =>
    http.post<Udhaar>(`/udhaar/${id}/repayments`, input),
  removeRepayment: (id: string, repaymentId: string) =>
    http.delete<Udhaar>(`/udhaar/${id}/repayments/${repaymentId}`),
};
