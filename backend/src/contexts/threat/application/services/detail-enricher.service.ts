import { Injectable } from '@nestjs/common';
import {
    RelationshipService,
    SightingService,
} from '../../../shared/application/services';
import {
    type EnrichedDetail,
    type RelatedObject,
} from '../dtos/enriched-detail.dto';
import { StixRefResolver } from './stix-ref-resolver.service';

@Injectable()
export class DetailEnricher {
    constructor(
        private readonly relationshipService: RelationshipService,
        private readonly sightingService: SightingService,
        private readonly stixRefResolver: StixRefResolver,
    ) {}

    async enrich<T extends { id: string }>(
        entity: T,
    ): Promise<EnrichedDetail<T>> {
        const [sourceRels, targetRels, sightings] = await Promise.all([
            this.relationshipService.findBySourceRef(entity.id),
            this.relationshipService.findByTargetRef(entity.id),
            this.sightingService.findBySightingOfRef(entity.id),
        ]);

        const allRelationships = [...sourceRels, ...targetRels];

        const relatedObjects: RelatedObject[] = await Promise.all(
            allRelationships.map(async (rel) => {
                const otherRef =
                    rel.sourceRef === entity.id ? rel.targetRef : rel.sourceRef;
                const object = await this.stixRefResolver.resolve(otherRef);
                return { relationship: rel, object: object ?? null };
            }),
        );

        return { entity, relatedObjects, sightings };
    }
}
