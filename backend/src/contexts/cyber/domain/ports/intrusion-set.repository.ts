import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import { SortCriteria } from '../../../shared/application/dtos/sort.dto';
import { IntrusionSet } from '../entities/intrusion-set.entity';

export abstract class IntrusionSetRepository {
    abstract findById(id: string): Promise<IntrusionSet | null>;

    abstract findAll(
        filter: Partial<{ name: string; tlp: string }>,
        page: number,
        limit: number,
        sort: SortCriteria,
    ): Promise<PaginatedResponse<IntrusionSet>>;

    abstract findByName(name: string): Promise<IntrusionSet | null>;

    abstract save(entity: IntrusionSet): Promise<IntrusionSet>;

    abstract update(
        id: string,
        entity: Partial<IntrusionSet>,
    ): Promise<IntrusionSet | null>;

    abstract delete(id: string): Promise<boolean>;
}
