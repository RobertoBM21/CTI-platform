import { formatDate } from '@/shared/lib/stix';
import { CalendarDays } from 'lucide-react';

interface ObservationWindowProps {
    firstSeen?: string;
    lastSeen?: string;
}

export function ObservationWindow({
    firstSeen,
    lastSeen,
}: ObservationWindowProps) {
    if (!firstSeen && !lastSeen) return null;

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {firstSeen && <DateCard label="First Seen" date={firstSeen} />}
            {lastSeen && <DateCard label="Last Seen" date={lastSeen} />}
        </div>
    );
}

function DateCard({ label, date }: { label: string; date: string }) {
    return (
        <div className="bg-card flex items-start gap-4 rounded-xl border px-6 py-5 shadow-sm">
            <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-full">
                <CalendarDays className="text-foreground/50 size-5" />
            </div>
            <div>
                <p className="text-foreground/40 mb-0.5 text-[0.6rem] font-bold tracking-widest uppercase">
                    {label}
                </p>
                <p className="font-bold">{formatDate(date)}</p>
            </div>
        </div>
    );
}
