import { Injectable } from '@nestjs/common';
import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import {
    type SortCriteria,
    SortOrder,
} from '../../../shared/application/dtos/sort.dto';
import { ThreatActor, ThreatActorRepository } from '../../domain';
import { ThreatCatalogQueryDto } from '../dtos/threat-catalog-query.dto';

@Injectable()
export class ThreatActorService {
    constructor(
        private readonly threatActorRepository: ThreatActorRepository,
    ) {}

    list(
        query: ThreatCatalogQueryDto,
    ): Promise<PaginatedResponse<ThreatActor>> {
        const sort: SortCriteria = {
            field: query.sortBy,
            direction: query.sortOrder === SortOrder.ASC ? 1 : -1,
        };

        return this.threatActorRepository.findAll(
            {
                name: query.name,
                tlp: query.tlp,
            },
            query.page,
            query.limit,
            sort,
        );
    }

    findById(id: string): Promise<ThreatActor | null> {
        return this.threatActorRepository.findById(id);
    }
}
