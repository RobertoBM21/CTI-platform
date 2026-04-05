import { Injectable } from '@nestjs/common';
import { Sighting, SightingRepository } from '../../domain';

@Injectable()
export class SightingService {
    constructor(private readonly sightingRepository: SightingRepository) {}

    findById(id: string): Promise<Sighting | null> {
        return this.sightingRepository.findById(id);
    }

    findBySightingOfRef(sightingOfRef: string): Promise<Sighting[]> {
        return this.sightingRepository.findBySightingOfRef(sightingOfRef);
    }

    save(entity: Sighting): Promise<Sighting> {
        return this.sightingRepository.save(entity);
    }
}
