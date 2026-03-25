import { Injectable } from '@nestjs/common';
import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import {
    type SortCriteria,
    SortOrder,
} from '../../../shared/application/dtos/sort.dto';
import { Ioc, IocRepository } from '../../domain';
import { type IocListQuery, IocListSortBy } from '../dtos/ioc-list-query.dto';

@Injectable()
export class IocService {
    constructor(private readonly iocRepository: IocRepository) {}

    list(query: IocListQuery): Promise<PaginatedResponse<Ioc>> {
        const sort: SortCriteria = {
            field: query.sortBy ?? IocListSortBy.CREATED_AT,
            direction:
                (query.sortOrder ?? SortOrder.DESC) === SortOrder.ASC ? 1 : -1,
        };

        if (query.sourceType && query.sourceId) {
            return this.iocRepository.findBySource(
                query.sourceType,
                query.sourceId,
                query.page,
                query.limit,
                sort,
            );
        }

        return this.iocRepository.findAll(
            {
                type: query.type,
                value: query.value,
                tlp: query.tlp,
            },
            query.page,
            query.limit,
            sort,
        );
    }
}
