import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import { SortCriteria } from '../../../shared/application/dtos/sort.dto';
import { AttackPattern } from '../entities/attack-pattern.entity';

export abstract class AttackPatternRepository {
    abstract findById(id: string): Promise<AttackPattern | null>;

    abstract findAll(
        filter: Partial<{ name: string; tlp: string }>,
        page: number,
        limit: number,
        sort: SortCriteria,
    ): Promise<PaginatedResponse<AttackPattern>>;

    abstract findByExternalReference(
        ref: string,
    ): Promise<AttackPattern | null>;

    abstract create(entity: AttackPattern): Promise<AttackPattern>;

    abstract update(
        id: string,
        entity: Partial<AttackPattern>,
    ): Promise<AttackPattern | null>;

    abstract delete(id: string): Promise<boolean>;
}
