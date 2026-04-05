import { Injectable } from '@nestjs/common';
import { Location, LocationRepository } from '../../domain';

@Injectable()
export class LocationService {
    constructor(private readonly locationRepository: LocationRepository) {}

    findById(id: string): Promise<Location | null> {
        return this.locationRepository.findById(id);
    }

    save(entity: Location): Promise<Location> {
        return this.locationRepository.save(entity);
    }
}
