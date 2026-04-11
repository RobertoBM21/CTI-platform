'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ConfidenceBadgeProps {
    confidence: number | null;
    className?: string;
}

function getConfidenceLevel(confidence: number): {
    label: string;
    className: string;
    icon: React.ComponentType<{ className?: string }>;
} {
    if (confidence >= 80) {
        return {
            label: 'Verified',
            className:
                'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
            icon: CheckCircle2,
        };
    }
    if (confidence >= 50) {
        return {
            label: 'Pending',
            className:
                'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300',
            icon: CheckCircle2,
        };
    }
    return {
        label: 'Draft',
        className:
            'border-zinc-200 bg-zinc-50 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400',
        icon: XCircle,
    };
}

export function ConfidenceBadge({
    confidence,
    className,
}: ConfidenceBadgeProps) {
    if (confidence === null || confidence === undefined) return null;
    const config = getConfidenceLevel(confidence);
    const Icon = config.icon;
    return (
        <Badge
            variant="outline"
            className={cn(
                'h-6 gap-1.5 rounded-full px-2.5 text-[0.65rem] leading-none font-medium [&>svg]:shrink-0',
                config.className,
                className,
            )}
        >
            <Icon className="size-3" />
            {config.label}
        </Badge>
    );
}
