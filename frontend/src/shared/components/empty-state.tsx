import { cn } from '@/lib/utils';
import type React from 'react';

interface EmptyStateProps {
    icon?: React.ComponentType<{ className?: string }>;
    title: string;
    description?: string;
    className?: string;
    /** Optional action slot (e.g. a button or link) */
    children?: React.ReactNode;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    className,
    children,
}: EmptyStateProps) {
    return (
        <div className={cn('py-16 text-center', className)}>
            {Icon && (
                <div className="bg-card border-card mx-auto mb-5 flex size-16 items-center justify-center rounded-full border shadow-sm">
                    <Icon className="text-foreground/20 size-7" />
                </div>
            )}
            <h3 className="text-base font-bold">{title}</h3>
            {description && (
                <p className="text-foreground/50 mt-1.5 text-sm">
                    {description}
                </p>
            )}
            {children && <div className="mt-4">{children}</div>}
        </div>
    );
}
