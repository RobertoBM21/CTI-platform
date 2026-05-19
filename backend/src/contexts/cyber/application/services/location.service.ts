import { Injectable } from '@nestjs/common';
import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import {
    type SortCriteria,
    SortOrder,
} from '../../../shared/application/dtos/sort.dto';
import { Location, LocationRepository } from '../../domain';
import { LocationCatalogQueryDto } from '../dtos/location-catalog-query.dto';

@Injectable()
export class LocationService {
    constructor(private readonly locationRepository: LocationRepository) {}

    list(query: LocationCatalogQueryDto): Promise<PaginatedResponse<Location>> {
        const sort: SortCriteria = {
            field: query.sortBy,
            direction: query.sortOrder === SortOrder.ASC ? 1 : -1,
        };

        return this.locationRepository.findAll(
            { name: query.name, tlp: query.tlp },
            query.page,
            query.limit,
            sort,
        );
    }

    findById(id: string): Promise<Location | null> {
        return this.locationRepository.findById(id);
    }

    save(entity: Location): Promise<Location> {
        return this.locationRepository.save(entity);
    }
}
