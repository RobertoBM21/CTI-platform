import { Injectable } from '@nestjs/common';
import { ThreatActor, ThreatActorRepository } from '../../domain';
import { ThreatDetailQueryDto } from '../dtos';

@Injectable()
export class GetThreatActorDetailUseCase {
    constructor(
        private readonly threatActorRepository: ThreatActorRepository,
    ) {}

    execute(query: ThreatDetailQueryDto): Promise<ThreatActor | null> {
        return this.threatActorRepository.findById(query.id);
    }
}
