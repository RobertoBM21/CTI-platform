'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { stixTypeIconMap } from '@/shared/components/entity-type-badge';
import { formatDateTime, getStixConfig } from '@/shared/lib/stix';
import { X } from 'lucide-react';

export interface DetailSidePanelNode {
    id: string;
    name: string;
    abbr: string;
    color: string;
    entityType: string;
    confidence?: number;
    createdAt?: string;
    description?: string;
    source?: string;
    relType?: string;
    relColor?: string;
}

interface DetailSidePanelProps {
    node: DetailSidePanelNode;
    onClose: () => void;
    className?: string;
}

export function DetailSidePanel({
    node,
    onClose,
    className,
}: DetailSidePanelProps) {
    const stixConfig = getStixConfig(node.entityType);
    const Icon = stixTypeIconMap[node.entityType];

    return (
        <div
            className={cn(
                'bg-background/95 w-60 rounded-xl border shadow-xl backdrop-blur-sm',
                className,
            )}
        >
            {/* Header */}
            <div className="flex items-start gap-2.5 border-b p-3">
                <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: node.color }}
                >
                    {Icon ? (
                        <Icon className="size-4" />
                    ) : (
                        <span className="text-[0.6rem] font-bold">
                            {node.abbr}
                        </span>
                    )}
                </span>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm leading-tight font-bold">
                        {node.name}
                    </p>
                    <p
                        className="mt-0.5 text-[0.6rem] font-bold tracking-widest uppercase"
                        style={{ color: node.color }}
                    >
                        {stixConfig.label}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="text-foreground/40 hover:text-foreground mt-0.5 shrink-0 rounded p-0.5 transition-colors"
                    aria-label="Close panel"
                >
                    <X size={13} />
                </button>
            </div>

            {/* Body */}
            <div className="space-y-2.5 p-3">
                {node.relType && (
                    <div className="flex items-center justify-between">
                        <span className="text-foreground/50 text-[0.6rem] font-bold tracking-widest uppercase">
                            Rel. type
                        </span>
                        <Badge
                            variant="outline"
                            className="text-[0.6rem] font-medium"
                            style={
                                node.relColor
                                    ? {
                                          color: node.relColor,
                                          borderColor: node.relColor + '70',
                                          backgroundColor: node.relColor + '18',
                                      }
                                    : {}
                            }
                        >
                            {node.relType}
                        </Badge>
                    </div>
                )}
                <DetailRow label="Domain" value={stixConfig.domain} />
                {node.createdAt && (
                    <DetailRow
                        label="Timestamp"
                        value={formatDateTime(node.createdAt)}
                    />
                )}
                {node.source && (
                    <DetailRow label="Source" value={node.source} />
                )}
                {node.confidence !== undefined && (
                    <DetailRow
                        label="Confidence"
                        value={`${node.confidence}%`}
                    />
                )}
                {node.description && (
                    <p className="text-foreground/60 border-t pt-2.5 text-[0.7rem] leading-relaxed">
                        {node.description.length > 180
                            ? node.description.slice(0, 180) + '\u2026'
                            : node.description}
                    </p>
                )}
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-2">
            <span className="text-foreground/50 text-[0.6rem] font-bold tracking-widest whitespace-nowrap uppercase">
                {label}
            </span>
            <span className="text-right text-xs font-medium">{value}</span>
        </div>
    );
}
