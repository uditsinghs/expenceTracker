import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMonth } from '@/hooks/useMonth';
import { cn } from '@/lib/utils';
import { formatMonthLabel, formatMonthLabelShort } from '@/utils/date';

export function MonthSwitcher({ className }: { className?: string }) {
  const { month, goToPreviousMonth, goToNextMonth, goToCurrentMonth, isCurrentMonth } = useMonth();

  return (
    <div className={cn('flex shrink-0 items-center gap-0.5 sm:gap-1', className)}>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 sm:h-10 sm:w-10"
        onClick={goToPreviousMonth}
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <button
        type="button"
        onClick={goToCurrentMonth}
        title={isCurrentMonth ? 'Current month' : 'Jump to current month'}
        className="min-w-[5.25rem] rounded-md px-1 py-1 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-w-[7.5rem] sm:px-2"
      >
        <span className="hidden sm:inline">{formatMonthLabel(month)}</span>
        <span className="sm:hidden">{formatMonthLabelShort(month)}</span>
      </button>

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 sm:h-10 sm:w-10"
        onClick={goToNextMonth}
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
