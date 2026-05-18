import { Injectable } from '@nestjs/common';
import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import {
    type SortCriteria,
    SortOrder,
} from '../../../shared/application/dtos/sort.dto';
import { IntrusionSet, IntrusionSetRepository } from '../../domain';
import { IntrusionSetCatalogQueryDto } from '../dtos/intrusion-set-catalog-query.dto';

@Injectable()
export class IntrusionSetService {
    constructor(
        private readonly intrusionSetRepository: IntrusionSetRepository,
    ) {}

    list(
        query: IntrusionSetCatalogQueryDto,
    ): Promise<PaginatedResponse<IntrusionSet>> {
        const sort: SortCriteria = {
            field: query.sortBy,
            direction: query.sortOrder === SortOrder.ASC ? 1 : -1,
        };

        return this.intrusionSetRepository.findAll(
            {
                name: query.name,
                tlp: query.tlp,
            },
            query.page,
            query.limit,
            sort,
        );
    }

    findById(id: string): Promise<IntrusionSet | null> {
        return this.intrusionSetRepository.findById(id);
    }

    save(entity: IntrusionSet): Promise<IntrusionSet> {
        return this.intrusionSetRepository.save(entity);
    }
}
