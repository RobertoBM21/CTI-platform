'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import type { TLP } from '../types/enums';
import { ConfidenceBadge } from './confidence-badge';
import { TlpBadge } from './tlp-badge';

interface DetailPageHeaderProps {
    /** Short uppercase label for the entity type, e.g. "INCIDENT" */
    entityTypeLabel: string;
    /** Route to navigate back to, e.g. "/incidents" */
    backPath: string;
    name: string;
    tlp: TLP;
    confidence?: number | null;
    onExportPdf?: () => void;
    className?: string;
}

export function DetailPageHeader({
    entityTypeLabel,
    backPath,
    name,
    tlp,
    confidence,
    onExportPdf,
    className,
}: DetailPageHeaderProps) {
    return (
        <div
            className={cn(
                'bg-background/90 sticky top-0 z-10 border-b backdrop-blur-sm',
                className,
            )}
        >
            <div className="flex items-center gap-3 px-6 py-3 lg:px-10">
                {/* Left: back + meta + title */}
                <Link
                    href={backPath}
                    className="text-foreground/50 hover:text-foreground shrink-0 rounded-lg p-1 transition-colors"
                    aria-label={`Back to ${entityTypeLabel.toLowerCase()}s`}
                >
                    <ArrowLeft className="size-4" />
                </Link>

                <div className="text-foreground/40 shrink-0 text-sm font-medium select-none">
                    {entityTypeLabel}
                </div>

                <span className="text-foreground/80 min-w-0 flex-1 truncate text-sm font-semibold">
                    {name}
                </span>

                {/* Right: actions */}
                <div className="flex shrink-0 items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onExportPdf}
                        className="text-foreground/70 hover:text-foreground"
                    >
                        <Download className="size-4" />
                        <span className="ml-1.5 hidden sm:inline">
                            Export PDF
                        </span>
                    </Button>
                    <ConfidenceBadge
                        confidence={confidence ?? null}
                        className="h-7 px-3 text-xs"
                    />
                    <TlpBadge tlp={tlp} className="h-7 px-3 text-xs" />
                </div>
            </div>
        </div>
    );
}
