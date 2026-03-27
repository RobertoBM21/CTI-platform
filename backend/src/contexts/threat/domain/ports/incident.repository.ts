import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import { SortCriteria } from '../../../shared/application/dtos/sort.dto';
import { Incident } from '../entities/incident.entity';

export abstract class IncidentRepository {
    abstract findById(id: string): Promise<Incident | null>;

    abstract findAll(
        filter: Partial<{ name: string; tlp: string }>,
        page: number,
        limit: number,
        sort: SortCriteria,
    ): Promise<PaginatedResponse<Incident>>;

    abstract create(entity: Incident): Promise<Incident>;

    abstract update(
        id: string,
        entity: Partial<Incident>,
    ): Promise<Incident | null>;

    abstract delete(id: string): Promise<boolean>;
}
