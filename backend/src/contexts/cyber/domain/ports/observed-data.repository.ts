import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import { SortCriteria } from '../../../shared/application/dtos/sort.dto';
import { ObservedData } from '../entities/observed-data.entity';

export abstract class ObservedDataRepository {
    abstract findById(id: string): Promise<ObservedData | null>;

    abstract findAll(
        filter: Partial<{ tlp: string }>,
        page: number,
        limit: number,
        sort: SortCriteria,
    ): Promise<PaginatedResponse<ObservedData>>;

    abstract save(entity: ObservedData): Promise<ObservedData>;

    abstract update(
        id: string,
        entity: Partial<ObservedData>,
    ): Promise<ObservedData | null>;

    abstract delete(id: string): Promise<boolean>;
}
