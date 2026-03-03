import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import { Incident } from '../entities/incident.entity';

export abstract class IncidentRepository {
    abstract findById(id: string): Promise<Incident | null>;

    abstract findAll(
        filter: Partial<{ name: string; tlp: string }>,
        page: number,
        limit: number,
    ): Promise<PaginatedResponse<Incident>>;

    abstract findByCampaignId(campaignId: string): Promise<Incident[]>;

    abstract findByThreatActorId(threatActorId: string): Promise<Incident[]>;

    abstract create(entity: Incident): Promise<Incident>;

    abstract update(
        id: string,
        entity: Partial<Incident>,
    ): Promise<Incident | null>;

    abstract delete(id: string): Promise<boolean>;
}
