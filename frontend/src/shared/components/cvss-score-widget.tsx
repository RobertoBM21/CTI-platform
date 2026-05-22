'use client';

import { Badge } from '@/components/ui/badge';

interface CvssScoreWidgetProps {
    score?: number;
    vector?: string;
    epssScore?: number;
}

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'unknown';

function getSeverity(score?: number): Severity {
    if (score == null || Number.isNaN(score)) return 'unknown';
    if (score >= 9) return 'critical';
    if (score >= 7) return 'high';
    if (score >= 4) return 'medium';
    if (score > 0) return 'low';
    return 'unknown';
}

const severityConfig: Record<
    Severity,
    {
        label: string;
        ring: string;
        bar: string;
        badge: string;
        value: string;
    }
> = {
    critical: {
        label: 'Critical',
        ring: 'from-red-500 to-red-600',
        bar: 'bg-red-500',
        badge: 'border-red-200 bg-red-50 text-red-700',
        value: 'text-red-700',
    },
    high: {
        label: 'High',
        ring: 'from-orange-500 to-orange-600',
        bar: 'bg-orange-500',
        badge: 'border-orange-200 bg-orange-50 text-orange-700',
        value: 'text-orange-700',
    },
    medium: {
        label: 'Medium',
        ring: 'from-amber-500 to-amber-600',
        bar: 'bg-amber-500',
        badge: 'border-amber-200 bg-amber-50 text-amber-700',
        value: 'text-amber-700',
    },
    low: {
        label: 'Low',
        ring: 'from-emerald-500 to-emerald-600',
        bar: 'bg-emerald-500',
        badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        value: 'text-emerald-700',
    },
    unknown: {
        label: 'Unknown',
        ring: 'from-slate-400 to-slate-500',
        bar: 'bg-slate-400',
        badge: 'border-slate-200 bg-slate-50 text-slate-700',
        value: 'text-slate-700',
    },
};

export function CvssScoreWidget({
    score,
    vector,
    epssScore,
}: CvssScoreWidgetProps) {
    const severity = getSeverity(score);
    const config = severityConfig[severity];
    const normalized = Math.max(0, Math.min(10, score ?? 0));
    const percent = (normalized / 10) * 100;

    return (
        <div className="bg-card rounded-xl border p-5">
            <p className="text-foreground/50 mb-4 text-xs font-bold tracking-widest uppercase">
                Vulnerability Severity
            </p>

            <div className="grid gap-5 md:grid-cols-[auto,1fr] md:items-center">
                <div className="relative mx-auto size-28">
                    <div
                        className={`absolute inset-0 rounded-full bg-linear-to-br ${config.ring} p-1.5`}
                    >
                        <div className="bg-card flex size-full items-center justify-center rounded-full">
                            <div className="text-center">
                                <p
                                    className={`text-3xl font-extrabold ${config.value}`}
                                >
                                    {score != null ? score.toFixed(1) : 'N/A'}
                                </p>
                                <p className="text-foreground/50 text-[0.68rem] font-semibold uppercase">
                                    CVSS v3
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={config.badge}>
                            {config.label}
                        </Badge>
                        {epssScore != null && (
                            <Badge
                                variant="outline"
                                className="border-indigo-200 bg-indigo-50 text-indigo-700"
                            >
                                EPSS {Math.round(epssScore * 1000) / 10}%
                            </Badge>
                        )}
                    </div>

                    <div>
                        <div className="bg-muted h-2.5 w-full overflow-hidden rounded-full">
                            <div
                                className={`${config.bar} h-full rounded-full transition-all`}
                                style={{ width: `${percent}%` }}
                            />
                        </div>
                        <div className="text-foreground/55 mt-1 flex items-center justify-between text-xs">
                            <span>0.0</span>
                            <span>10.0</span>
                        </div>
                    </div>

                    {vector && (
                        <div>
                            <p className="text-foreground/50 text-[0.62rem] font-bold tracking-widest uppercase">
                                CVSS Vector
                            </p>
                            <code className="bg-muted/60 mt-1 block rounded-md px-2 py-1 font-mono text-xs break-all">
                                {vector}
                            </code>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
