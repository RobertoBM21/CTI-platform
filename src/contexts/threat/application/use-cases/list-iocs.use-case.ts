import { Injectable } from '@nestjs/common';
import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import { Ioc, IocRepository } from '../../domain';
import { IocListQueryDto } from '../dtos';

@Injectable()
export class ListIocsUseCase {
    constructor(private readonly iocRepository: IocRepository) {}

    execute(query: IocListQueryDto): Promise<PaginatedResponse<Ioc>> {
        if (query.sourceType && query.sourceId) {
            return this.iocRepository.findBySource(
                query.sourceType,
                query.sourceId,
                query.page,
                query.limit,
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
        );
    }
}
