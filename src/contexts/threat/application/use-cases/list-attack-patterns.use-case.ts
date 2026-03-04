import { Injectable } from '@nestjs/common';
import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import { AttackPattern, AttackPatternRepository } from '../../domain';
import { ThreatCatalogQueryDto } from '../dtos';

@Injectable()
export class ListAttackPatternsUseCase {
    constructor(
        private readonly attackPatternRepository: AttackPatternRepository,
    ) {}

    execute(
        query: ThreatCatalogQueryDto,
    ): Promise<PaginatedResponse<AttackPattern>> {
        return this.attackPatternRepository.findAll(
            {
                name: query.name,
                tlp: query.tlp,
            },
            query.page,
            query.limit,
        );
    }
}
