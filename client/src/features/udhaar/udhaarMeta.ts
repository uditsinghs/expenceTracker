import type { BadgeProps } from '@/components/ui/badge';
import type { Udhaar, UdhaarStatus, UdhaarType } from '@/types';

export const statusLabel: Record<UdhaarStatus, string> = {
  PENDING: 'Pending',
  PARTIALLY_PAID: 'Partially paid',
  SETTLED: 'Settled',
};

export const statusVariant: Record<UdhaarStatus, BadgeProps['variant']> = {
  PENDING: 'warning',
  PARTIALLY_PAID: 'secondary',
  SETTLED: 'success',
};

export const typeLabel: Record<UdhaarType, string> = {
  I_GAVE: 'I gave',
  I_TOOK: 'I took',
};

/** Plain language line explaining what a record means for the user. */
export function udhaarMeaning(record: Udhaar): string {
  if (record.status === 'SETTLED') {
    return record.type === 'I_GAVE'
      ? `${record.personName} has returned everything`
      : `You have returned everything to ${record.personName}`;
  }
  return record.type === 'I_GAVE'
    ? `${record.personName} has to return this to you`
    : `You have to return this to ${record.personName}`;
}

/** Wording for the repayment action, which flips direction per type. */
export function repaymentWording(type: UdhaarType) {
  return type === 'I_GAVE'
    ? { action: 'Record money received', past: 'Received', helper: 'How much did you get back?' }
    : { action: 'Record money returned', past: 'Returned', helper: 'How much did you pay back?' };
}
