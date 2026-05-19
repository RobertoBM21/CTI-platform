import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type React from 'react';

interface StatsCardProps {
    label: string;
    value: number | string;
    icon: React.ComponentType<{ className?: string }>;
    iconClassName?: string;
    valueClassName?: string;
    description?: string;
}

export function StatsCard({
    label,
    value,
    icon: Icon,
    iconClassName,
    valueClassName,
    description,
}: StatsCardProps) {
    return (
        <Card className="gap-0 rounded-xl py-0 shadow-sm">
            <CardHeader className="px-5 pt-5 pb-2">
                <div className="flex items-center justify-between">
                    <span className="text-foreground/60 text-xs font-semibold tracking-widest uppercase">
                        {label}
                    </span>
                    <div
                        className={cn(
                            'bg-muted/60 flex size-8 items-center justify-center rounded-lg',
                            iconClassName,
                        )}
                    >
                        <Icon className="size-4 text-current" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
                <p
                    className={cn(
                        'text-foreground text-3xl font-bold tabular-nums',
                        valueClassName,
                    )}
                >
                    {value}
                </p>
                {description && (
                    <p className="text-foreground/50 mt-1 text-xs">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
