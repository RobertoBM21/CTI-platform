'use client';

import { cn } from '@/lib/utils';

interface ConfidenceBarProps {
    confidence: number;
    className?: string;
}

export function ConfidenceBar({ confidence, className }: ConfidenceBarProps) {
    const fillColor =
        confidence >= 80
            ? 'bg-emerald-500'
            : confidence >= 50
              ? 'bg-amber-500'
              : 'bg-zinc-400';

    return (
        <div className={cn('flex w-28 items-center gap-1.5', className)}>
            <div className="bg-muted/50 h-1 flex-1 overflow-hidden rounded-full">
                <div
                    className={cn(
                        'h-full rounded-full transition-all',
                        fillColor,
                    )}
                    style={{ width: `${confidence}%` }}
                />
            </div>
            <span className="text-foreground/40 min-w-8 text-right text-[0.6rem] font-semibold tabular-nums">
                {confidence}%
            </span>
        </div>
    );
}
