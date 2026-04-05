import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import { SortCriteria } from '../../../shared/application/dtos/sort.dto';
import { Indicator } from '../entities/indicator.entity';

export abstract class IndicatorRepository {
    abstract findById(id: string): Promise<Indicator | null>;

    abstract findAll(
        filter: Partial<{
            type: string;
            value: string;
            name: string;
            tlp: string;
        }>,
        page: number,
        limit: number,
        sort: SortCriteria,
    ): Promise<PaginatedResponse<Indicator>>;

    abstract findByValue(value: string): Promise<Indicator[]>;

    abstract save(entity: Indicator): Promise<Indicator>;

    abstract update(
        id: string,
        entity: Partial<Indicator>,
    ): Promise<Indicator | null>;

    abstract delete(id: string): Promise<boolean>;
}
