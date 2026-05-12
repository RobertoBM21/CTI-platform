'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { EntityType } from '@/shared/types/enums';
import {
    Bug,
    CheckCircle,
    Crosshair,
    Eye,
    FileText,
    Globe,
    MapPin,
    Megaphone,
    MessageSquare,
    Server,
    Shield,
    ShieldAlert,
    Target,
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
        icon: Target,
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
