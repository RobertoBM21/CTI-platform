import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type React from 'react';

interface SectionCardProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    iconClassName?: string;
    labelClassName?: string;
    /** When true, renders an em dash placeholder instead of children */
    empty?: boolean;
    children?: React.ReactNode;
}

export function SectionCard({
    icon: Icon,
    label,
    iconClassName = 'text-foreground/40',
    labelClassName = 'text-foreground/40',
    empty = false,
    children,
}: SectionCardProps) {
    return (
        <Card className="gap-0 rounded-xl py-0 shadow-sm">
            <CardHeader className="px-5 py-3">
                <div className="flex items-center gap-1.5">
                    <Icon className={cn('size-3.5', iconClassName)} />
                    <span
                        className={cn(
                            'text-[0.65rem] font-bold tracking-widest uppercase',
                            labelClassName,
                        )}
                    >
                        {label}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="px-5 pt-0 pb-5">
                {empty ? (
                    <span className="text-foreground/30 italic">—</span>
                ) : (
                    children
                )}
            </CardContent>
        </Card>
    );
}
