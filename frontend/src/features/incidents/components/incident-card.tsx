'use client';

import { cn } from '@/lib/utils';
import { ConfidenceBadge } from '@/shared/components/confidence-badge';
import { EntityTypeBadge } from '@/shared/components/entity-type-badge';
import { TlpBadge } from '@/shared/components/tlp-badge';
import { Building2, MoreHorizontal } from 'lucide-react';
import type { Incident } from '../types';

interface IncidentCardProps {
    incident: Incident;
    className?: string;
}

function formatDate(iso: string): string {
    return new Date(iso).toISOString().split('T')[0];
}

export function IncidentCard({ incident, className }: IncidentCardProps) {
    return (
        <article
            className={cn(
                'group bg-card hover:border-primary/30 relative flex h-full cursor-pointer flex-col rounded-2xl border border-transparent p-7 shadow-sm transition-all duration-300 hover:shadow-md',
                className,
            )}
        >
            {/* Top badges + more button */}
            <div className="mb-4 flex items-start justify-between gap-2">
                <div className="flex flex-col items-start gap-2">
                    <EntityTypeBadge entityType={incident.entityType} />
                    <TlpBadge tlp={incident.tlp} />
                </div>
                <button
                    className="text-foreground/20 hover:text-primary opacity-0 transition-all group-hover:opacity-100"
                    aria-label="More options"
                >
                    <MoreHorizontal className="size-[18px]" />
                </button>
            </div>

            {/* Title */}
            <h3 className="group-hover:text-primary mb-3 text-lg leading-tight font-bold tracking-tight transition-colors">
                {incident.name}
            </h3>

            {/* Description */}
            {incident.description && (
                <p className="text-foreground/60 mb-5 line-clamp-3 flex-1 text-sm leading-relaxed">
                    {incident.description}
                </p>
            )}

            {/* Author section */}
            {(incident.createdBy ?? incident.source) && (
                <div className="bg-muted/30 mb-5 flex items-center gap-3 rounded-xl p-2">
                    <div className="bg-card flex size-8 items-center justify-center rounded-full text-xs font-bold shadow-sm">
                        {(incident.createdBy ?? incident.source)!
                            .charAt(0)
                            .toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold">
                            {incident.createdBy ?? incident.source}
                        </p>
                        {incident.source && (
                            <p className="text-foreground/60 mt-0.5 flex items-center gap-1 truncate text-[0.6rem]">
                                <Building2 className="size-[10px]" />{' '}
                                {incident.source}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="border-border/50 mt-auto flex items-center justify-between border-t pt-4">
                <ConfidenceBadge confidence={incident.confidence} />
                <span className="text-foreground/50 text-xs font-medium">
                    {formatDate(incident.createdAt)}
                </span>
            </div>
        </article>
    );
}
