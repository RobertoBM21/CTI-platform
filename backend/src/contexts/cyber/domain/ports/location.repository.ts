import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import { SortCriteria } from '../../../shared/application/dtos/sort.dto';
import { Location } from '../entities/location.entity';

export abstract class LocationRepository {
    abstract findById(id: string): Promise<Location | null>;

    abstract findAll(
        filter: Partial<{ name: string; tlp: string }>,
        page: number,
        limit: number,
        sort: SortCriteria,
    ): Promise<PaginatedResponse<Location>>;

    abstract findByName(name: string): Promise<Location | null>;

    abstract save(entity: Location): Promise<Location>;

    abstract update(
        id: string,
        entity: Partial<Location>,
    ): Promise<Location | null>;

    abstract delete(id: string): Promise<boolean>;
}
