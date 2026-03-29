import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AttackMotivation } from '../../../../shared/domain/value-objects/attack-motivation.vo';
import { ResourceLevel } from '../../../../shared/domain/value-objects/resource-level.vo';
import { BaseMongooseRepository } from '../../../../shared/infrastructure/persistence/base-mongoose.repository';
import { IntrusionSet, IntrusionSetRepository, TLP } from '../../../domain';
import {
    IntrusionSetDoc,
    IntrusionSetDocument,
} from '../schemas/intrusion-set.schema';

@Injectable()
export class IntrusionSetMongooseRepository
    extends BaseMongooseRepository<IntrusionSet, IntrusionSetDoc>
    implements IntrusionSetRepository
{
    constructor(
        @InjectModel(IntrusionSetDocument.name)
        model: Model<IntrusionSetDoc>,
    ) {
        super(model);
    }

    async findByName(name: string): Promise<IntrusionSet | null> {
        const doc = await this.model.findOne({ name }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    protected toDomain(doc: IntrusionSetDoc): IntrusionSet {
        return new IntrusionSet({
            id: doc.domainId,
            name: doc.name,
            description: doc.description,
            aliases: doc.aliases as unknown as string[],
            firstSeen: doc.firstSeen,
            lastSeen: doc.lastSeen,
            goals: doc.goals,
            resourceLevel: doc.resourceLevel as ResourceLevel | undefined,
            primaryMotivations:
                doc.primaryMotivations as unknown as AttackMotivation[],
            secondaryMotivations:
                doc.secondaryMotivations as unknown as AttackMotivation[],
            confidence: doc.confidence,
            revoked: doc.revoked,
            externalReferences: doc.externalReferences.map((r) => ({
                sourceName: r.sourceName,
                ...(r.description != null && {
                    description: r.description,
                }),
                ...(r.externalId != null && {
                    externalId: r.externalId,
                }),
                ...(r.url != null && { url: r.url }),
            })),
            tlp: doc.tlp as TLP,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    protected toPersistence(entity: IntrusionSet): Record<string, unknown> {
        return {
            domainId: entity.id,
            name: entity.name,
            description: entity.description,
            aliases: entity.aliases,
            firstSeen: entity.firstSeen,
            lastSeen: entity.lastSeen,
            goals: entity.goals,
            resourceLevel: entity.resourceLevel,
            primaryMotivations: entity.primaryMotivations,
            secondaryMotivations: entity.secondaryMotivations,
            confidence: entity.confidence,
            revoked: entity.revoked,
            externalReferences: entity.externalReferences,
            tlp: entity.tlp,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
}
