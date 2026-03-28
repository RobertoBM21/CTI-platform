import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import { SortCriteria } from '../../../shared/application/dtos/sort.dto';
import { Opinion } from '../entities/opinion.entity';

export abstract class OpinionRepository {
    abstract findById(id: string): Promise<Opinion | null>;

    abstract findAll(
        filter: Partial<{ tlp: string }>,
        page: number,
        limit: number,
        sort: SortCriteria,
    ): Promise<PaginatedResponse<Opinion>>;

    abstract create(entity: Opinion): Promise<Opinion>;

    abstract update(
        id: string,
        entity: Partial<Opinion>,
    ): Promise<Opinion | null>;

    abstract delete(id: string): Promise<boolean>;
}
