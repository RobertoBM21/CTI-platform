import { Injectable } from '@nestjs/common';
import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import { Incident, IncidentRepository } from '../../domain';
import { ThreatCatalogQueryDto } from '../dtos';

@Injectable()
export class ListIncidentsUseCase {
    constructor(private readonly incidentRepository: IncidentRepository) {}

    execute(
        query: ThreatCatalogQueryDto,
    ): Promise<PaginatedResponse<Incident>> {
        return this.incidentRepository.findAll(
            {
                name: query.name,
                tlp: query.tlp,
            },
            query.page,
            query.limit,
        );
    }
}
