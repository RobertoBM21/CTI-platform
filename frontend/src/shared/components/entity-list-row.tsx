'use client';

import { cn } from '@/lib/utils';
import { Building2, Clock, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import type { CatalogEntity } from '../types/entity';
import { ConfidenceBadge } from './confidence-badge';
import { EntityTypeBadge } from './entity-type-badge';
import { TlpBadge } from './tlp-badge';

interface EntityListRowProps {
    entity: CatalogEntity;
    /** Route prefix, e.g. "/incidents" or "/campaigns" */
    basePath: string;
    detailQueryParams?: Record<string, string | undefined>;
    className?: string;
}

function formatDate(iso: string): string {
    return new Date(iso).toISOString().split('T')[0];
}

export function EntityListRow({
    entity,
    basePath,
    detailQueryParams,
    className,
}: EntityListRowProps) {
    const query = new URLSearchParams();
    Object.entries(detailQueryParams ?? {}).forEach(([key, value]) => {
        if (value) {
            query.set(key, value);
        }
    });
    const href = `${basePath}/${entity.id}${query.toString() ? `?${query.toString()}` : ''}`;

    return (
        <Link href={href} className={cn('block', className)}>
            <article
                className={cn(
                    'group bg-card hover:border-primary/30 flex flex-col gap-5 rounded-2xl border border-transparent p-7 shadow-sm transition-all hover:shadow-md',
                )}
            >
                <div>
                    <div className="mb-3">
                        <h3 className="group-hover:text-primary text-lg font-bold tracking-tight transition-colors">
                            {entity.name}
                        </h3>
                    </div>
                    {entity.description && (
                        <p className="text-foreground/60 max-w-4xl text-sm leading-relaxed">
                            {entity.description}
                        </p>
                    )}
                </div>

                {/* Meta row */}
                <div className="border-border/50 flex flex-wrap items-center justify-between gap-4 border-t pt-5 text-sm">
                    <div className="flex flex-wrap items-center gap-3.5 md:gap-4">
                        <EntityTypeBadge entityType={entity.entityType} />
                        <TlpBadge tlp={entity.tlp} />

                        {(() => {
                            const author =
                                entity.createdBy ?? entity.source ?? null;
                            return (
                                <div className="text-foreground/72 flex items-center gap-2.5">
                                    <div className="bg-muted/50 text-foreground flex size-6 items-center justify-center rounded-full text-[0.6rem] font-bold">
                                        {author
                                            ? author.charAt(0).toUpperCase()
                                            : 'U'}
                                    </div>
                                    <span className="text-xs font-semibold">
                                        {author ?? 'Unknown'}
                                    </span>
                                    {entity.source && (
                                        <>
                                            <span className="text-foreground/20">
                                                •
                                            </span>
                                            <div className="text-foreground/58 flex items-center gap-1.5 text-xs">
                                                <Building2 className="size-3" />
                                                <span>{entity.source}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    <div className="flex items-center gap-2">
                        <ConfidenceBadge confidence={entity.confidence} />
                        <div className="bg-muted/30 text-foreground/52 flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium">
                            <Clock className="size-3" />
                            {formatDate(entity.createdAt)}
                        </div>
                        <div className="bg-muted/30 text-foreground/52 flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium">
                            <RefreshCw className="size-3" />
                            {formatDate(entity.updatedAt)}
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}
