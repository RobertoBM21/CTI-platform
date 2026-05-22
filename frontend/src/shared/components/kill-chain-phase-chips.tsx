'use client';

import { Badge } from '@/components/ui/badge';
import { formatVocabLabel } from '@/shared/lib/stix';

interface KillChainPhase {
    killChainName: string;
    phaseName: string;
}

interface KillChainPhaseChipsProps {
    phases: KillChainPhase[];
}

const palette = [
    'border-red-200 bg-red-50 text-red-700',
    'border-cyan-200 bg-cyan-50 text-cyan-700',
    'border-violet-200 bg-violet-50 text-violet-700',
    'border-orange-200 bg-orange-50 text-orange-700',
];

export function KillChainPhaseChips({ phases }: KillChainPhaseChipsProps) {
    if (phases.length === 0) return null;

    const grouped = phases.reduce<Record<string, string[]>>((acc, phase) => {
        if (!acc[phase.killChainName]) {
            acc[phase.killChainName] = [];
        }
        acc[phase.killChainName].push(phase.phaseName);
        return acc;
    }, {});

    return (
        <div className="space-y-3">
            {Object.entries(grouped).map(
                ([killChainName, phaseNames], groupIndex) => (
                    <div key={killChainName}>
                        <p className="text-foreground/50 mb-2 text-[0.68rem] font-bold tracking-widest uppercase">
                            {formatVocabLabel(killChainName)}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {phaseNames.map((phaseName) => (
                                <Badge
                                    key={`${killChainName}-${phaseName}`}
                                    variant="outline"
                                    className={
                                        palette[groupIndex % palette.length]
                                    }
                                >
                                    {formatVocabLabel(phaseName)}
                                </Badge>
                            ))}
                        </div>
                    </div>
                ),
            )}
        </div>
    );
}
