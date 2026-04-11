import type { EntityType, TLP } from '@/shared/types/enums';

export interface Incident {
    id: string;
    name: string;
    description: string | null;
    entityType: EntityType;
    tlp: TLP;
    confidence: number | null;
    createdBy: string;
    source: string;
    createdAt: string;
    updatedAt: string;
}

export interface IncidentFilters {
    name?: string;
    tlp?: TLP;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export type ViewMode = 'list' | 'grid';
