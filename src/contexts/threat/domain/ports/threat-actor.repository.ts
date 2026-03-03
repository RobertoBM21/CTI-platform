import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import { ThreatActor } from '../entities/threat-actor.entity';

export abstract class ThreatActorRepository {
    abstract findById(id: string): Promise<ThreatActor | null>;

    abstract findAll(
        filter: Partial<{ name: string; tlp: string }>,
        page: number,
        limit: number,
    ): Promise<PaginatedResponse<ThreatActor>>;

    abstract findByName(name: string): Promise<ThreatActor | null>;

    abstract create(entity: ThreatActor): Promise<ThreatActor>;

    abstract update(
        id: string,
        entity: Partial<ThreatActor>,
    ): Promise<ThreatActor | null>;

    abstract delete(id: string): Promise<boolean>;
}
