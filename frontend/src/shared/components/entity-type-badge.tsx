'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { EntityType } from '@/shared/types/enums';
import {
    Activity,
    Bug,
    CheckCircle,
    Crosshair,
    Eye,
    FileText,
    Globe,
    MapPin,
    Megaphone,
    MessageSquare,
    Microscope,
    Server,
    Shield,
    ShieldAlert,
    User,
    Users,
    Wrench,
} from 'lucide-react';

export const entityConfig: Record<
    EntityType,
    {
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        className: string;
    }
> = {
    incident: {
        label: 'INCIDENT',
        icon: Shield,
        className:
            'border-primary/30 text-primary bg-primary/5 hover:bg-primary/5',
    },
    'threat-actor': {
        label: 'THREAT ACTOR',
        icon: User,
        className:
            'border-violet-300 text-violet-700 bg-violet-50 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:bg-violet-950',
    },
    campaign: {
        label: 'CAMPAIGN',
        icon: Megaphone,
        className:
            'border-sky-300 text-sky-700 bg-sky-50 hover:bg-sky-50 dark:border-sky-700 dark:text-sky-300 dark:bg-sky-950',
    },
    'attack-pattern': {
        label: 'ATTACK PATTERN',
        icon: Crosshair,
        className:
            'border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:bg-rose-950',
    },
    indicator: {
        label: 'INDICATOR',
        icon: Globe,
        className:
            'border-teal-300 text-teal-700 bg-teal-50 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-300 dark:bg-teal-950',
    },
    malware: {
        label: 'MALWARE',
        icon: Bug,
        className:
            'border-red-300 text-red-700 bg-red-50 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:bg-red-950',
    },
    tool: {
        label: 'TOOL',
        icon: Wrench,
        className:
            'border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-300 dark:bg-orange-950',
    },
    vulnerability: {
        label: 'VULNERABILITY',
        icon: ShieldAlert,
        className:
            'border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:bg-amber-950',
    },
    infrastructure: {
        label: 'INFRASTRUCTURE',
        icon: Server,
        className:
            'border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:bg-slate-950',
    },
    'intrusion-set': {
        label: 'INTRUSION SET',
        icon: Users,
        className:
            'border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:bg-purple-950',
    },
    identity: {
        label: 'IDENTITY',
        icon: User,
        className:
            'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:bg-blue-950',
    },
    location: {
        label: 'LOCATION',
        icon: MapPin,
        className:
            'border-green-300 text-green-700 bg-green-50 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-950',
    },
    'course-of-action': {
        label: 'COURSE OF ACTION',
        icon: CheckCircle,
        className:
            'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:bg-emerald-950',
    },
    note: {
        label: 'NOTE',
        icon: FileText,
        className:
            'border-zinc-300 text-zinc-700 bg-zinc-50 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:bg-zinc-950',
    },
    opinion: {
        label: 'OPINION',
        icon: MessageSquare,
        className:
            'border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-300 dark:bg-indigo-950',
    },
    'malware-analysis': {
        label: 'MALWARE ANALYSIS',
        icon: Eye,
        className:
            'border-fuchsia-300 text-fuchsia-700 bg-fuchsia-50 hover:bg-fuchsia-50 dark:border-fuchsia-700 dark:text-fuchsia-300 dark:bg-fuchsia-950',
    },
    'observed-data': {
        label: 'OBSERVED DATA',
        icon: Eye,
        className:
            'border-cyan-300 text-cyan-700 bg-cyan-50 hover:bg-cyan-50 dark:border-cyan-700 dark:text-cyan-300 dark:bg-cyan-950',
    },
    report: {
        label: 'REPORT',
        icon: FileText,
        className:
            'border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-300 dark:bg-indigo-950',
    },
};

/** Icon map for all STIX 2.1 SDO types — use in graph nodes and entity lists */
export const stixTypeIconMap: Record<
    string,
    React.ComponentType<{ className?: string }>
> = {
    // Shared EntityType icons — derived from entityConfig as single source of truth
    incident: entityConfig['incident'].icon,
    'threat-actor': entityConfig['threat-actor'].icon,
    campaign: entityConfig['campaign'].icon,
    'attack-pattern': entityConfig['attack-pattern'].icon,
    indicator: entityConfig['indicator'].icon,
    // STIX-only types
    malware: Bug,
    tool: Wrench,
    vulnerability: ShieldAlert,
    infrastructure: Server,
    'intrusion-set': Users,
    identity: User,
    location: MapPin,
    'course-of-action': CheckCircle,
    note: FileText,
    opinion: MessageSquare,
    sighting: Eye,
    'malware-analysis': Microscope,
    'observed-data': Activity,
    report: FileText,
};

interface EntityTypeBadgeProps {
    entityType: EntityType;
    className?: string;
}

export function EntityTypeBadge({
    entityType,
    className,
}: EntityTypeBadgeProps) {
    const config = entityConfig[entityType];
    const Icon = config.icon;
    return (
        <Badge
            variant="outline"
            className={cn(
                'h-6 gap-1.5 rounded-full px-2.5 text-[0.65rem] leading-none font-bold tracking-[0.02em] [&>svg]:shrink-0',
                config.className,
                className,
            )}
        >
            <Icon className="size-3" />
            {config.label}
        </Badge>
    );
}
