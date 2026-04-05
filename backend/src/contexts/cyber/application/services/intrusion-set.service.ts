import { Injectable } from '@nestjs/common';
import { IntrusionSet, IntrusionSetRepository } from '../../domain';

@Injectable()
export class IntrusionSetService {
    constructor(
        private readonly intrusionSetRepository: IntrusionSetRepository,
    ) {}

    findById(id: string): Promise<IntrusionSet | null> {
        return this.intrusionSetRepository.findById(id);
    }

    save(entity: IntrusionSet): Promise<IntrusionSet> {
        return this.intrusionSetRepository.save(entity);
    }
}
