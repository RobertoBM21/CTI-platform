'use client';

import { cn } from '@/lib/utils';
import { ConfidenceBadge } from '@/shared/components/confidence-badge';
import { EntityTypeBadge } from '@/shared/components/entity-type-badge';
import { TlpBadge } from '@/shared/components/tlp-badge';
import { Building2 } from 'lucide-react';
import Link from 'next/link';
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
        <Link
            href={`/incidents/${incident.id}`}
            className={cn('block h-full', className)}
        >
            <article
                className={cn(
                    'group bg-card hover:border-primary/30 relative flex h-full flex-col rounded-2xl border border-transparent p-7 shadow-sm transition-all duration-300 hover:shadow-md',
                )}
            >
                {/* Top badges */}
                <div className="mb-4 flex flex-col items-start gap-2">
                    <EntityTypeBadge entityType={incident.entityType} />
                    <TlpBadge tlp={incident.tlp} />
                </div>

                <h3 className="group-hover:text-primary mb-3 text-lg leading-tight font-bold tracking-tight transition-colors">
                    {incident.name}
                </h3>

                {incident.description && (
                    <p className="text-foreground/60 mb-5 line-clamp-3 flex-1 text-sm leading-relaxed">
                        {incident.description}
                    </p>
                )}

                {/* Author section */}
                {(() => {
                    const author =
                        incident.createdBy ?? incident.source ?? null;
                    return (
                        <div className="bg-muted/30 mb-5 flex items-center gap-3 rounded-xl p-2">
                            <div className="bg-card flex size-8 items-center justify-center rounded-full text-xs font-bold shadow-sm">
                                {author ? author.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-bold">
                                    {author ?? 'Unknown'}
                                </p>
                                {incident.source && (
                                    <p className="text-foreground/60 mt-0.5 flex items-center gap-1 truncate text-[0.6rem]">
                                        <Building2 className="size-2.5" />{' '}
                                        {incident.source}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })()}

                {/* Footer */}
                <div className="border-border/50 mt-auto border-t pt-4">
                    <div className="mb-3 flex items-center justify-between">
                        <ConfidenceBadge confidence={incident.confidence} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-foreground/40 text-[0.6rem] font-bold tracking-widest uppercase">
                                Created
                            </span>
                            <span className="text-foreground/50 text-xs font-medium">
                                {formatDate(incident.createdAt)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-foreground/40 text-[0.6rem] font-bold tracking-widest uppercase">
                                Updated
                            </span>
                            <span className="text-foreground/50 text-xs font-medium">
                                {formatDate(incident.updatedAt)}
                            </span>
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}
