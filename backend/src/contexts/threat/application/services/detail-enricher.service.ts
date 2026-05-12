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

        const allCenterRelationships = [...sourceRels, ...targetRels];
        const seenRelIds = new Set(allCenterRelationships.map((r) => r.id));

        const centerRelatedObjects: RelatedObject[] = await Promise.all(
            allCenterRelationships.map(async (rel) => {
                const otherRef =
                    rel.sourceRef === entity.id ? rel.targetRef : rel.sourceRef;
                const object = await this.stixRefResolver.resolve(otherRef);
                return { relationship: rel, object: object ?? null };
            }),
        );

        // Collect IDs of peripheral nodes discovered via center relationships
        const peripheralIds = new Set<string>(
            centerRelatedObjects
                .filter((r) => r.object !== null)
                .map((r) => (r.object as { id: string }).id),
        );

        // Fetch outgoing relationships from each peripheral node and include
        // those where both endpoints are already-known peripheral nodes
        const pSourceRelsArrays = await Promise.all(
            [...peripheralIds].map((pid) =>
                this.relationshipService.findBySourceRef(pid),
            ),
        );

        const seenInterRelIds = new Set<string>();
        const interPeripheralRelatedObjects: RelatedObject[] = [];
        for (const rels of pSourceRelsArrays) {
            for (const rel of rels) {
                if (seenRelIds.has(rel.id) || seenInterRelIds.has(rel.id))
                    continue;
                if (peripheralIds.has(rel.targetRef)) {
                    seenInterRelIds.add(rel.id);
                    const object = await this.stixRefResolver.resolve(
                        rel.targetRef,
                    );
                    interPeripheralRelatedObjects.push({
                        relationship: rel,
                        object: object ?? null,
                    });
                }
            }
        }

        return {
            entity,
            relatedObjects: [
                ...centerRelatedObjects,
                ...interPeripheralRelatedObjects,
            ],
            sightings,
        };
    }
}
