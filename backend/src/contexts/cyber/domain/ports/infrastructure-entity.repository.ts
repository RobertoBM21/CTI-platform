import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import { SortCriteria } from '../../../shared/application/dtos/sort.dto';
import { InfrastructureEntity } from '../entities/infrastructure-entity.entity';

export abstract class InfrastructureEntityRepository {
    abstract findById(id: string): Promise<InfrastructureEntity | null>;

    abstract findAll(
        filter: Partial<{ name: string; tlp: string }>,
        page: number,
        limit: number,
        sort: SortCriteria,
    ): Promise<PaginatedResponse<InfrastructureEntity>>;

    abstract findByName(name: string): Promise<InfrastructureEntity | null>;

    abstract create(
        entity: InfrastructureEntity,
    ): Promise<InfrastructureEntity>;

    abstract update(
        id: string,
        entity: Partial<InfrastructureEntity>,
    ): Promise<InfrastructureEntity | null>;

    abstract delete(id: string): Promise<boolean>;
}
