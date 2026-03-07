import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import { SortCriteria } from '../../../shared/application/dtos/sort.dto';
import { Ioc, IocSourceType } from '../entities/ioc.entity';

export abstract class IocRepository {
    abstract findById(id: string): Promise<Ioc | null>;

    abstract findAll(
        filter: Partial<{ type: string; value: string; tlp: string }>,
        page: number,
        limit: number,
        sort: SortCriteria,
    ): Promise<PaginatedResponse<Ioc>>;

    abstract findBySource(
        sourceType: IocSourceType,
        sourceId: string,
        page: number,
        limit: number,
        sort: SortCriteria,
    ): Promise<PaginatedResponse<Ioc>>;

    abstract findByValue(value: string): Promise<Ioc[]>;

    abstract create(entity: Ioc): Promise<Ioc>;

    abstract update(id: string, entity: Partial<Ioc>): Promise<Ioc | null>;

    abstract delete(id: string): Promise<boolean>;
}
