import { Injectable } from '@nestjs/common';
import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import {
    type SortCriteria,
    SortOrder,
} from '../../../shared/application/dtos/sort.dto';
import { AttackPattern, AttackPatternRepository } from '../../domain';
import { ThreatCatalogQueryDto } from '../dtos/threat-catalog-query.dto';

@Injectable()
export class AttackPatternService {
    constructor(
        private readonly attackPatternRepository: AttackPatternRepository,
    ) {}

    list(
        query: ThreatCatalogQueryDto,
    ): Promise<PaginatedResponse<AttackPattern>> {
        const sort: SortCriteria = {
            field: query.sortBy,
            direction: query.sortOrder === SortOrder.ASC ? 1 : -1,
        };

        return this.attackPatternRepository.findAll(
            {
                name: query.name,
                tlp: query.tlp,
            },
            query.page,
            query.limit,
            sort,
        );
    }

    findById(id: string): Promise<AttackPattern | null> {
        return this.attackPatternRepository.findById(id);
    }
}
