import { Injectable } from '@nestjs/common';
import { AttackPattern, AttackPatternRepository } from '../../domain';
import { ThreatDetailQueryDto } from '../dtos';

@Injectable()
export class GetAttackPatternDetailUseCase {
    constructor(
        private readonly attackPatternRepository: AttackPatternRepository,
    ) {}

    execute(query: ThreatDetailQueryDto): Promise<AttackPattern | null> {
        return this.attackPatternRepository.findById(query.id);
    }
}
