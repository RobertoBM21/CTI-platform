import { Injectable } from '@nestjs/common';
import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import {
    type SortCriteria,
    SortOrder,
} from '../../../shared/application/dtos/sort.dto';
import { Indicator, IndicatorRepository } from '../../domain';
import {
    type IndicatorListQuery,
    IndicatorListSortBy,
} from '../dtos/indicator-list-query.dto';

@Injectable()
export class IndicatorService {
    constructor(private readonly indicatorRepository: IndicatorRepository) {}

    list(query: IndicatorListQuery): Promise<PaginatedResponse<Indicator>> {
        const sort: SortCriteria = {
            field: query.sortBy ?? IndicatorListSortBy.CREATED_AT,
            direction:
                (query.sortOrder ?? SortOrder.DESC) === SortOrder.ASC ? 1 : -1,
        };

        return this.indicatorRepository.findAll(
            {
                type: query.type,
                value: query.value,
                name: query.name,
                tlp: query.tlp,
            },
            query.page,
            query.limit,
            sort,
        );
    }

    findById(id: string): Promise<Indicator | null> {
        return this.indicatorRepository.findById(id);
    }

    save(entity: Indicator): Promise<Indicator> {
        return this.indicatorRepository.save(entity);
    }
}
