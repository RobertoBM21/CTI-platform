'use client';

import { cn } from '@/lib/utils';
import { ConfidenceBadge } from '@/shared/components/confidence-badge';
import { EntityTypeBadge } from '@/shared/components/entity-type-badge';
import { TlpBadge } from '@/shared/components/tlp-badge';
import { Building2, Clock, MoreHorizontal } from 'lucide-react';
import type { Incident } from '../types';

interface IncidentListRowProps {
    incident: Incident;
    className?: string;
}

function formatDate(iso: string): string {
    return new Date(iso).toISOString().split('T')[0];
}

export function IncidentListRow({ incident, className }: IncidentListRowProps) {
    return (
        <article
            className={cn(
                'group bg-card hover:border-primary/30 flex cursor-pointer flex-col gap-5 rounded-2xl border border-transparent p-7 shadow-sm transition-all hover:shadow-md',
                className,
            )}
        >
            {/* Title + more button */}
            <div>
                <div className="mb-3 flex items-start justify-between">
                    <h3 className="group-hover:text-primary text-lg font-bold tracking-tight transition-colors">
                        {incident.name}
                    </h3>
                    <button
                        className="text-foreground/20 hover:text-primary -mt-2 -mr-2 p-2 transition-colors"
                        aria-label="More options"
                    >
                        <MoreHorizontal className="size-5" />
                    </button>
                </div>
                {incident.description && (
                    <p className="text-foreground/60 max-w-4xl text-sm leading-relaxed">
                        {incident.description}
                    </p>
                )}
            </div>

            {/* Meta row */}
            <div className="border-border/50 flex flex-wrap items-center justify-between gap-4 border-t pt-5 text-sm">
                <div className="flex flex-wrap items-center gap-3.5 md:gap-4">
                    <EntityTypeBadge entityType={incident.entityType} />
                    <TlpBadge tlp={incident.tlp} />

                    {(incident.createdBy ?? incident.source) && (
                        <div className="text-foreground/72 flex items-center gap-2.5">
                            <div className="bg-muted/50 text-foreground flex size-6 items-center justify-center rounded-full text-[0.6rem] font-bold">
                                {(incident.createdBy ?? incident.source)!
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>
                            <span className="text-xs font-semibold">
                                {incident.createdBy ?? incident.source}
                            </span>
                            {incident.source && (
                                <>
                                    <span className="text-foreground/20">
                                        •
                                    </span>
                                    <div className="text-foreground/58 flex items-center gap-1.5 text-xs">
                                        <Building2 className="size-3" />
                                        <span>{incident.source}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <ConfidenceBadge confidence={incident.confidence} />
                    <div className="bg-muted/30 text-foreground/52 flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium">
                        <Clock className="size-3" />
                        {formatDate(incident.createdAt)}
                    </div>
                </div>
            </div>
        </article>
    );
}
