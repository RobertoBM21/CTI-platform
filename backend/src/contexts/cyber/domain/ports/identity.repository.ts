import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import { SortCriteria } from '../../../shared/application/dtos/sort.dto';
import { Identity } from '../entities/identity.entity';

export abstract class IdentityRepository {
    abstract findById(id: string): Promise<Identity | null>;

    abstract findAll(
        filter: Partial<{ name: string; tlp: string }>,
        page: number,
        limit: number,
        sort: SortCriteria,
    ): Promise<PaginatedResponse<Identity>>;

    abstract findByName(name: string): Promise<Identity | null>;

    abstract save(entity: Identity): Promise<Identity>;

    abstract update(
        id: string,
        entity: Partial<Identity>,
    ): Promise<Identity | null>;

    abstract delete(id: string): Promise<boolean>;
}
