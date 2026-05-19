import type { CatalogEntity } from '@/shared/types/entity';

// ── Stats ──────────────────────────────────────────────────────────────

export interface DashboardStats {
    totalIncidents: number;
    totalCampaigns: number;
    totalThreatActors: number;
}

// ── Location ───────────────────────────────────────────────────────────

export interface LocationItem {
    id: string;
    name: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    country?: string;
    city?: string;
    region?: string;
    confidence?: number;
    tlp: string;
    createdAt: string;
    updatedAt: string;
}

// ── Chart data ─────────────────────────────────────────────────────────

export interface ChartBarItem {
    id: string;
    name: string;
    shortName: string;
    value: number;
}

export interface CountryChartItem {
    country: string;
    count: number;
}

// ── Threat domain tab ──────────────────────────────────────────────────

export type DashboardTab = 'overview' | 'threat-domain';

export interface SelectedEntity {
    id: string;
    name: string;
    entityType: CatalogEntity['entityType'];
}
