import {
    domainConfig,
    entityConfig,
} from '@/shared/components/entity-type-badge';
import { LayoutDashboard } from 'lucide-react';
import type { ComponentType } from 'react';

export interface AppNavItem {
    label: string;
    href: string;
    icon: ComponentType<{ className?: string }>;
}

export const SECTION_LABELS: Record<string, string> = {
    home: 'Home',
    incidents: 'Incidents',
    campaigns: 'Campaigns',
    'threat-actors': 'Threat Actors',
    reports: 'Reports',
    'threat-domain': 'Threat Domain',
    malware: 'Malware',
    tools: 'Tools',
    vulnerabilities: 'Vulnerabilities',
    'intrusion-sets': 'Intrusion Sets',
    'cyber-domain': 'Cyber Domain',
};

export const DOMAIN_DETAIL_SEGMENTS = [
    'incidents',
    'campaigns',
    'threat-actors',
    'malware',
    'tools',
    'vulnerabilities',
    'intrusion-sets',
] as const;

export const homeNavItems: AppNavItem[] = [
    {
        label: 'Home',
        href: '/home',
        icon: LayoutDashboard,
    },
];

export const generalNavItems: AppNavItem[] = [
    {
        label: 'Incidents',
        href: '/incidents',
        icon: entityConfig.incident.icon,
    },
    {
        label: 'Campaigns',
        href: '/campaigns',
        icon: entityConfig.campaign.icon,
    },
    {
        label: 'Threat Actors',
        href: '/threat-actors',
        icon: entityConfig['threat-actor'].icon,
    },
    {
        label: 'Reports',
        href: '/reports',
        icon: entityConfig.report.icon,
    },
];

export const domainNavItems: AppNavItem[] = [
    {
        label: domainConfig['threat-domain'].label,
        href: '/threat-domain',
        icon: domainConfig['threat-domain'].icon,
    },
    {
        label: domainConfig['cyber-domain'].label,
        href: '/cyber-domain',
        icon: domainConfig['cyber-domain'].icon,
    },
];
