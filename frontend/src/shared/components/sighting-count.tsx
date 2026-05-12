import { SectionCard } from '@/shared/components/section-card';
import { formatDate } from '@/shared/lib/stix';
import type { SightingItem } from '@/shared/types/entity';
import { Eye } from 'lucide-react';

type SightingCountProps = Pick<
    SightingItem,
    'id' | 'count' | 'firstSeen' | 'lastSeen' | 'description'
>;

export function SightingCount({
    count,
    firstSeen,
    lastSeen,
    description,
}: SightingCountProps) {
    return (
        <SectionCard
            icon={Eye}
            label="Sighting"
            labelClassName="text-foreground/50"
        >
            <p className="text-foreground/80 text-lg font-bold">
                {count}
                <span className="text-foreground/40 ml-1 text-xs font-normal">
                    occurrence{count !== 1 ? 's' : ''}
                </span>
            </p>
            {(firstSeen ?? lastSeen) && (
                <p className="text-foreground/50 mt-1 text-xs">
                    {firstSeen && formatDate(firstSeen)}
                    {firstSeen && lastSeen && ' → '}
                    {lastSeen && formatDate(lastSeen)}
                </p>
            )}
            {description && (
                <p className="text-foreground/60 mt-1.5 text-xs leading-snug">
                    {description}
                </p>
            )}
        </SectionCard>
    );
}
