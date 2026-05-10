'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TLP } from '@/shared/types/enums';

const tlpConfig: Record<
    TLP,
    { label: string; className: string; dotClassName: string }
> = {
    [TLP.WHITE]: {
        label: 'TLP:WHITE',
        className:
            'border-foreground/15 bg-white text-foreground/85 dark:border-white/15 dark:bg-white/6 dark:text-white/88',
        dotClassName: 'bg-foreground/45 dark:bg-white/45',
    },
    [TLP.CLEAR]: {
        label: 'TLP:CLEAR',
        className:
            'border-foreground/15 bg-white text-foreground/85 dark:border-white/15 dark:bg-white/6 dark:text-white/88',
        dotClassName: 'bg-foreground/45 dark:bg-white/45',
    },
    [TLP.GREEN]: {
        label: 'TLP:GREEN',
        className:
            'border-emerald-200 bg-emerald-50/90 text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-950/50 dark:text-emerald-300',
        dotClassName: 'bg-emerald-500 dark:bg-emerald-400',
    },
    [TLP.AMBER]: {
        label: 'TLP:AMBER',
        className:
            'border-amber-200 bg-amber-50/90 text-amber-700 dark:border-amber-700/60 dark:bg-amber-950/50 dark:text-amber-300',
        dotClassName: 'bg-amber-500 dark:bg-amber-400',
    },
    [TLP.AMBER_STRICT]: {
        label: 'TLP:AMBER+STRICT',
        className:
            'border-orange-200 bg-orange-50/90 text-orange-700 dark:border-orange-700/60 dark:bg-orange-950/50 dark:text-orange-300',
        dotClassName: 'bg-orange-500 dark:bg-orange-400',
    },
    [TLP.RED]: {
        label: 'TLP:RED',
        className:
            'border-red-200 bg-red-50/90 text-red-700 dark:border-red-700/60 dark:bg-red-950/50 dark:text-red-300',
        dotClassName: 'bg-red-600 dark:bg-red-400',
    },
};

interface TlpBadgeProps {
    tlp: TLP;
    className?: string;
}

export function TlpBadge({ tlp, className }: TlpBadgeProps) {
    const config = tlpConfig[tlp];
    return (
        <Badge
            variant="outline"
            className={cn(
                'h-6 gap-2 rounded-full px-2.5 text-[0.65rem] leading-none font-bold tracking-[0.02em]',
                config.className,
                className,
            )}
        >
            <span
                className={cn(
                    'size-1.5 shrink-0 self-center rounded-full',
                    config.dotClassName,
                )}
            />
            {config.label}
        </Badge>
    );
}
