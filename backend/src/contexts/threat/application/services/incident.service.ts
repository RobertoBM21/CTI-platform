import { Injectable } from '@nestjs/common';
import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import {
    type SortCriteria,
    SortOrder,
} from '../../../shared/application/dtos/sort.dto';
import { RelationshipService } from '../../../shared/application/services/relationship.service';
import { Incident, IncidentRepository } from '../../domain';
import { ThreatCatalogQueryDto } from '../dtos/threat-catalog-query.dto';

@Injectable()
export class IncidentService {
    constructor(
        private readonly incidentRepository: IncidentRepository,
        private readonly relationshipService: RelationshipService,
    ) {}

    async list(
        query: ThreatCatalogQueryDto,
    ): Promise<PaginatedResponse<Incident>> {
        const sort: SortCriteria = {
            field: query.sortBy,
            direction: query.sortOrder === SortOrder.ASC ? 1 : -1,
        };

        let ids: string[] | undefined;

        if (query.attackPatternId) {
            ids = await this.resolveRelatedIds(
                query.attackPatternId,
                'incident--',
            );
        }

        return this.incidentRepository.findAll(
            {
                name: query.name,
                tlp: query.tlp,
                ids,
            },
            query.page,
            query.limit,
            sort,
        );
    }

    private async resolveRelatedIds(
        refId: string,
        prefix: string,
    ): Promise<string[]> {
        const [bySource, byTarget] = await Promise.all([
            this.relationshipService.findBySourceRef(refId),
            this.relationshipService.findByTargetRef(refId),
        ]);

        const ids = new Set<string>();

        for (const rel of bySource) {
            if (rel.targetRef.startsWith(prefix)) ids.add(rel.targetRef);
        }

        for (const rel of byTarget) {
            if (rel.sourceRef.startsWith(prefix)) ids.add(rel.sourceRef);
        }

        return [...ids];
    }

    findById(id: string): Promise<Incident | null> {
        return this.incidentRepository.findById(id);
    }

    save(entity: Incident): Promise<Incident> {
        return this.incidentRepository.save(entity);
    }
}
