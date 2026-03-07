import { Injectable } from '@nestjs/common';
import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import {
    type SortCriteria,
    SortOrder,
} from '../../../shared/application/dtos/sort.dto';
import { Incident, IncidentRepository } from '../../domain';
import { ThreatCatalogQueryDto } from '../dtos/threat-catalog-query.dto';

@Injectable()
export class ListIncidentsUseCase {
    constructor(private readonly incidentRepository: IncidentRepository) {}

    execute(
        query: ThreatCatalogQueryDto,
    ): Promise<PaginatedResponse<Incident>> {
        const sort: SortCriteria = {
            field: query.sortBy,
            direction: query.sortOrder === SortOrder.ASC ? 1 : -1,
        };

        return this.incidentRepository.findAll(
            {
                name: query.name,
                tlp: query.tlp,
            },
            query.page,
            query.limit,
            sort,
        );
    }
}
