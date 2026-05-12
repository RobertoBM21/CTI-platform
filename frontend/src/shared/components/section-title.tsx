import type React from 'react';

interface SectionTitleProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
}

export function SectionTitle({ icon: Icon, title }: SectionTitleProps) {
    return (
        <div className="flex items-center gap-2">
            <Icon className="text-primary size-4" />
            <h3 className="text-foreground/40 text-xs font-bold tracking-widest uppercase">
                {title}
            </h3>
        </div>
    );
}
