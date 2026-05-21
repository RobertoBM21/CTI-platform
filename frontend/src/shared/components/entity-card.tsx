'use client';

import { cn } from '@/lib/utils';
import { Building2 } from 'lucide-react';
import Link from 'next/link';
import type { CatalogEntity } from '../types/entity';
import { ConfidenceBadge } from './confidence-badge';
import { EntityTypeBadge } from './entity-type-badge';
import { TlpBadge } from './tlp-badge';

interface EntityCardProps {
    entity: CatalogEntity;
    /** Route prefix, e.g. "/incidents" or "/campaigns" */
    basePath: string;
    detailQueryParams?: Record<string, string | undefined>;
    className?: string;
}

function formatDate(iso: string): string {
    return new Date(iso).toISOString().split('T')[0];
}

export function EntityCard({
    entity,
    basePath,
    detailQueryParams,
    className,
}: EntityCardProps) {
    const query = new URLSearchParams();
    Object.entries(detailQueryParams ?? {}).forEach(([key, value]) => {
        if (value) {
            query.set(key, value);
        }
    });
    const href = `${basePath}/${entity.id}${query.toString() ? `?${query.toString()}` : ''}`;

    return (
        <Link href={href} className={cn('block h-full', className)}>
            <article
                className={cn(
                    'group bg-card hover:border-primary/30 relative flex h-full flex-col rounded-2xl border border-transparent p-7 shadow-sm transition-all duration-300 hover:shadow-md',
                )}
            >
                {/* Top row: entity type badge left, TLP badge right */}
                <div className="mb-4 flex items-start justify-between gap-2">
                    <EntityTypeBadge entityType={entity.entityType} />
                    <TlpBadge tlp={entity.tlp} />
                </div>

                <h3 className="group-hover:text-primary mb-3 text-lg leading-tight font-bold tracking-tight transition-colors">
                    {entity.name}
                </h3>

                {entity.description && (
                    <p className="text-foreground/60 mb-5 line-clamp-3 flex-1 text-sm leading-relaxed">
                        {entity.description}
                    </p>
                )}

                {/* Author section */}
                {(() => {
                    const author = entity.createdBy ?? entity.source ?? null;
                    return (
                        <div className="bg-muted/30 mb-5 flex items-center gap-3 rounded-xl p-2">
                            <div className="bg-card flex size-8 items-center justify-center rounded-full text-xs font-bold shadow-sm">
                                {author ? author.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-bold">
                                    {author ?? 'Unknown'}
                                </p>
                                {entity.source && (
                                    <p className="text-foreground/60 mt-0.5 flex items-center gap-1 truncate text-[0.6rem]">
                                        <Building2 className="size-2.5" />{' '}
                                        {entity.source}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })()}

                {/* Footer */}
                <div className="border-border/50 mt-auto border-t pt-4">
                    <div className="mb-3 flex items-center justify-between">
                        <ConfidenceBadge confidence={entity.confidence} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-foreground/40 text-[0.6rem] font-bold tracking-widest uppercase">
                                Created
                            </span>
                            <span className="text-foreground/50 text-xs font-medium">
                                {formatDate(entity.createdAt)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-foreground/40 text-[0.6rem] font-bold tracking-widest uppercase">
                                Updated
                            </span>
                            <span className="text-foreground/50 text-xs font-medium">
                                {formatDate(entity.updatedAt)}
                            </span>
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}
