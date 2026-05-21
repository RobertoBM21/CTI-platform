import { Injectable } from '@nestjs/common';
import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import {
    type SortCriteria,
    SortOrder,
} from '../../../shared/application/dtos/sort.dto';
import { Tool, ToolRepository } from '../../domain';
import { ToolCatalogQueryDto } from '../dtos/tool-catalog-query.dto';

@Injectable()
export class ToolService {
    constructor(private readonly toolRepository: ToolRepository) {}

    list(query: ToolCatalogQueryDto): Promise<PaginatedResponse<Tool>> {
        const sort: SortCriteria = {
            field: query.sortBy,
            direction: query.sortOrder === SortOrder.ASC ? 1 : -1,
        };

        return this.toolRepository.findAll(
            { name: query.name, tlp: query.tlp },
            query.page,
            query.limit,
            sort,
        );
    }

    findById(id: string): Promise<Tool | null> {
        return this.toolRepository.findById(id);
    }

    save(entity: Tool): Promise<Tool> {
        return this.toolRepository.save(entity);
    }
}
