import { Injectable } from '@nestjs/common';
import {
    InfrastructureEntity,
    InfrastructureEntityRepository,
} from '../../domain';

@Injectable()
export class InfrastructureEntityService {
    constructor(
        private readonly infrastructureEntityRepository: InfrastructureEntityRepository,
    ) {}

    findById(id: string): Promise<InfrastructureEntity | null> {
        return this.infrastructureEntityRepository.findById(id);
    }
}
