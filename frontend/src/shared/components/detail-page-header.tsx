'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
    ArrowLeft,
    ChevronDown,
    Download,
    FileDown,
    FileJson,
} from 'lucide-react';
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
    onExportJson?: () => void;
    className?: string;
}

export function DetailPageHeader({
    entityTypeLabel,
    backPath,
    name,
    tlp,
    confidence,
    onExportPdf,
    onExportJson,
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
                    className="text-foreground/50 hover:text-foreground flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 transition-colors"
                    aria-label={`Back to ${entityTypeLabel.toLowerCase()}s`}
                >
                    <ArrowLeft className="size-4" />
                    <span className="text-sm font-medium">
                        {entityTypeLabel}
                    </span>
                </Link>

                <span className="text-foreground/80 min-w-0 flex-1 truncate text-sm font-semibold">
                    {name}
                </span>

                {/* Right: actions */}
                <div className="flex shrink-0 items-center gap-2">
                    {(onExportJson || onExportPdf) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                className={cn(
                                    'text-foreground/80 hover:text-foreground bg-secondary hover:bg-secondary/80 inline-flex h-8 items-center gap-1.5 rounded-md border border-transparent px-3 text-sm font-medium transition-colors',
                                )}
                            >
                                <Download className="size-4" />
                                <span className="hidden sm:inline">Export</span>
                                <ChevronDown className="size-3" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center">
                                {onExportJson && (
                                    <DropdownMenuItem onClick={onExportJson}>
                                        <FileJson className="mr-1 size-4" />
                                        JSON
                                    </DropdownMenuItem>
                                )}
                                {onExportPdf && (
                                    <DropdownMenuItem onClick={onExportPdf}>
                                        <FileDown className="mr-1 size-4" />
                                        PDF
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
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
