import { Injectable } from '@nestjs/common';
import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import { ThreatActor, ThreatActorRepository } from '../../domain';
import { ThreatCatalogQueryDto } from '../dtos';

@Injectable()
export class ListThreatActorsUseCase {
    constructor(
        private readonly threatActorRepository: ThreatActorRepository,
    ) {}

    execute(
        query: ThreatCatalogQueryDto,
    ): Promise<PaginatedResponse<ThreatActor>> {
        return this.threatActorRepository.findAll(
            {
                name: query.name,
                tlp: query.tlp,
            },
            query.page,
            query.limit,
        );
    }
}
