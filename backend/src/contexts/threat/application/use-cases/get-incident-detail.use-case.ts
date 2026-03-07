import { Injectable } from '@nestjs/common';
import { Incident, IncidentRepository } from '../../domain';
import { ThreatDetailQueryDto } from '../dtos';

@Injectable()
export class GetIncidentDetailUseCase {
    constructor(private readonly incidentRepository: IncidentRepository) {}

    execute(query: ThreatDetailQueryDto): Promise<Incident | null> {
        return this.incidentRepository.findById(query.id);
    }
}
