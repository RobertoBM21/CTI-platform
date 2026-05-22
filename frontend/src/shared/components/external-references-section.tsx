'use client';

import { Button } from '@/components/ui/button';
import type { StixExternalRef } from '@/shared/types/entity';
import { ExternalLink } from 'lucide-react';
import { useMemo, useState } from 'react';

interface ExternalReferencesSectionProps {
    refs: StixExternalRef[];
    title?: string;
    showWhenEmpty?: boolean;
    emptyMessage?: string;
}

const DEFAULT_VISIBLE = 3;

export function ExternalReferencesSection({
    refs,
    title = 'External References',
    showWhenEmpty = false,
    emptyMessage = 'No external references available for this entity.',
}: ExternalReferencesSectionProps) {
    const [expanded, setExpanded] = useState(false);

    const visibleRefs = useMemo(() => {
        if (expanded || refs.length <= DEFAULT_VISIBLE) {
            return refs;
        }
        return refs.slice(0, DEFAULT_VISIBLE);
    }, [expanded, refs]);

    if (refs.length === 0 && !showWhenEmpty) return null;

    return (
        <div className="bg-card rounded-xl border p-5">
            <p className="text-foreground/50 mb-4 text-xs font-bold tracking-widest uppercase">
                {title}
            </p>

            {refs.length === 0 ? (
                <p className="text-foreground/45 text-sm">{emptyMessage}</p>
            ) : (
                <div className="space-y-3">
                    {visibleRefs.map((ref, index) => (
                        <div
                            key={`${ref.sourceName}-${ref.externalId ?? 'ref'}-${index}`}
                            className="bg-muted/30 rounded-lg border p-3"
                        >
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold">
                                    {ref.sourceName}
                                </p>
                                {ref.externalId && (
                                    <span className="bg-muted rounded-full border px-2 py-0.5 font-mono text-[0.65rem]">
                                        {ref.externalId}
                                    </span>
                                )}
                            </div>

                            {ref.description && (
                                <p className="text-foreground/65 mt-1 text-sm">
                                    {ref.description}
                                </p>
                            )}

                            {ref.url && (
                                <a
                                    href={ref.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary mt-2 inline-flex items-center gap-1 text-sm hover:underline"
                                >
                                    Open source
                                    <ExternalLink className="size-3.5" />
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {refs.length > DEFAULT_VISIBLE && (
                <div className="mt-4">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setExpanded((prev) => !prev)}
                    >
                        {expanded
                            ? 'Show fewer references'
                            : `Show ${refs.length - DEFAULT_VISIBLE} more references`}
                    </Button>
                </div>
            )}
        </div>
    );
}
