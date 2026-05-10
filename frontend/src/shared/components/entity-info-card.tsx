'use client';

import { Badge } from '@/components/ui/badge';
import { Building2, CalendarDays } from 'lucide-react';
import type { StixExternalRef, StixObject } from '../types/entity';
import { ConfidenceBadge } from './confidence-badge';

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-CA');
}

interface EntityInfoCardProps {
    name: string;
    description?: string | null;
    confidence?: number | null;
    createdAt: string;
    updatedAt: string;
    /** First external reference — shown as "Lead Author" */
    primaryRef?: StixExternalRef;
    /** Tags derived from related objects (attack patterns, campaigns, etc.) */
    tags?: StixObject[];
}

export function EntityInfoCard({
    name,
    description,
    confidence,
    createdAt,
    updatedAt,
    primaryRef,
    tags = [],
}: EntityInfoCardProps) {
    return (
        <div className="bg-card rounded-2xl border p-6 shadow-sm lg:p-8">
            <div className="flex gap-10">
                {/* Left: badges + title + description + tags */}
                <div className="min-w-0 flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <ConfidenceBadge confidence={confidence ?? null} />
                        {tags.length > 0 && (
                            <span className="text-foreground/40 text-xs font-bold tracking-widest uppercase">
                                {tags[0].name ?? ''}
                            </span>
                        )}
                    </div>

                    <h1 className="text-2xl leading-snug font-bold lg:text-3xl">
                        {name}
                    </h1>

                    {description && (
                        <blockquote className="border-primary/40 text-foreground/70 border-l-4 pl-5 text-sm leading-relaxed italic">
                            {description}
                        </blockquote>
                    )}

                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                            {tags.map((obj) => (
                                <Badge
                                    key={obj.id}
                                    variant="outline"
                                    className="text-foreground/60 text-xs"
                                >
                                    {obj.name ?? obj.id}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Lead Author + Creation Date */}
                <aside className="hidden w-56 shrink-0 space-y-6 lg:block">
                    {primaryRef && (
                        <div>
                            <p className="text-foreground/40 mb-3 text-[0.65rem] font-bold tracking-widest uppercase">
                                Lead Author
                            </p>
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                                    {primaryRef.sourceName
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold">
                                        {primaryRef.sourceName}
                                    </p>
                                    <div className="text-foreground/50 mt-0.5 flex items-center gap-1 text-sm">
                                        <Building2 className="size-3.5 shrink-0" />
                                        <span className="truncate">
                                            {primaryRef.sourceName}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <p className="text-foreground/40 mb-3 text-[0.65rem] font-bold tracking-widest uppercase">
                            Creation Date
                        </p>
                        <div className="flex items-start gap-3">
                            <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-full">
                                <CalendarDays className="text-foreground/50 size-5" />
                            </div>
                            <div>
                                <p className="font-bold">
                                    {formatDate(createdAt)}
                                </p>
                                <p className="text-foreground/40 mt-0.5 text-sm">
                                    Last mod: {formatDate(updatedAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
