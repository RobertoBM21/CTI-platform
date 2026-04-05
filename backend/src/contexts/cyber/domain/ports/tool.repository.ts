import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import { SortCriteria } from '../../../shared/application/dtos/sort.dto';
import { Tool } from '../entities/tool.entity';

export abstract class ToolRepository {
    abstract findById(id: string): Promise<Tool | null>;

    abstract findAll(
        filter: Partial<{ name: string; tlp: string }>,
        page: number,
        limit: number,
        sort: SortCriteria,
    ): Promise<PaginatedResponse<Tool>>;

    abstract findByName(name: string): Promise<Tool | null>;

    abstract save(entity: Tool): Promise<Tool>;

    abstract update(id: string, entity: Partial<Tool>): Promise<Tool | null>;

    abstract delete(id: string): Promise<boolean>;
}
