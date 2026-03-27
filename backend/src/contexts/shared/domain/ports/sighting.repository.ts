import { PaginatedResponse } from '../../application/dtos/pagination.dto';
import { SortCriteria } from '../../application/dtos/sort.dto';
import { Sighting } from '../entities/sighting.entity';

export abstract class SightingRepository {
    abstract findById(id: string): Promise<Sighting | null>;

    abstract findAll(
        filter: Partial<{
            sightingOfRef: string;
            tlp: string;
        }>,
        page: number,
        limit: number,
        sort: SortCriteria,
    ): Promise<PaginatedResponse<Sighting>>;

    abstract findBySightingOfRef(sightingOfRef: string): Promise<Sighting[]>;

    abstract create(entity: Sighting): Promise<Sighting>;

    abstract update(
        id: string,
        entity: Partial<Sighting>,
    ): Promise<Sighting | null>;

    abstract delete(id: string): Promise<boolean>;
}
