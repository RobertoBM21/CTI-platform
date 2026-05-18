import { Injectable } from '@nestjs/common';
import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import {
    type SortCriteria,
    SortOrder,
} from '../../../shared/application/dtos/sort.dto';
import { RelationshipService } from '../../../shared/application/services/relationship.service';
import { ThreatActor, ThreatActorRepository } from '../../domain';
import { ThreatCatalogQueryDto } from '../dtos/threat-catalog-query.dto';

@Injectable()
export class ThreatActorService {
    constructor(
        private readonly threatActorRepository: ThreatActorRepository,
        private readonly relationshipService: RelationshipService,
    ) {}

    async list(
        query: ThreatCatalogQueryDto,
    ): Promise<PaginatedResponse<ThreatActor>> {
        const sort: SortCriteria = {
            field: query.sortBy,
            direction: query.sortOrder === SortOrder.ASC ? 1 : -1,
        };

        let ids: string[] | undefined;

        const filterRefId = query.attackPatternId ?? query.intrusionSetId;

        if (filterRefId) {
            ids = await this.resolveRelatedIds(filterRefId, 'threat-actor--');
        }

        return this.threatActorRepository.findAll(
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

    findById(id: string): Promise<ThreatActor | null> {
        return this.threatActorRepository.findById(id);
    }

    save(entity: ThreatActor): Promise<ThreatActor> {
        return this.threatActorRepository.save(entity);
    }
}
