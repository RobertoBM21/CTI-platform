import { Injectable } from '@nestjs/common';
import { ObservedData, ObservedDataRepository } from '../../domain';

@Injectable()
export class ObservedDataService {
    constructor(
        private readonly observedDataRepository: ObservedDataRepository,
    ) {}

    findById(id: string): Promise<ObservedData | null> {
        return this.observedDataRepository.findById(id);
    }

    save(entity: ObservedData): Promise<ObservedData> {
        return this.observedDataRepository.save(entity);
    }
}
