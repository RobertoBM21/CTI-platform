import { Relationship } from '../../../shared/domain/entities/relationship.entity';
import { Sighting } from '../../../shared/domain/entities/sighting.entity';

export interface RelatedObject {
    relationship: Relationship;
    object: unknown;
}

export interface EnrichedDetail<T> {
    entity: T;
    relatedObjects: RelatedObject[];
    sightings: Sighting[];
}
