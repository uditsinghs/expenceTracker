import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type AmountFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

/** Money input with a permanent ₹ prefix and a large, thumb friendly hit area. */
export const AmountField = forwardRef<HTMLInputElement, AmountFieldProps>(
  ({ className, ...props }, ref) => (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg font-medium text-muted-foreground">
        ₹
      </span>
      <Input
        ref={ref}
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        placeholder="0"
        className={cn('h-14 pl-8 text-2xl font-semibold tabular', className)}
        {...props}
      />
    </div>
  ),
);
AmountField.displayName = 'AmountField';
