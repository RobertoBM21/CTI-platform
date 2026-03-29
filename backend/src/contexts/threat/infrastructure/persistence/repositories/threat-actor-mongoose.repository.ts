import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseMongooseRepository } from '../../../../shared/infrastructure/persistence/base-mongoose.repository';
import {
    AttackMotivation,
    ResourceLevel,
    ThreatActor,
    ThreatActorRepository,
    ThreatActorRole,
    ThreatActorSophistication,
    ThreatActorType,
    TLP,
} from '../../../domain';
import {
    ThreatActorDoc,
    ThreatActorDocument,
} from '../schemas/threat-actor.schema';

@Injectable()
export class ThreatActorMongooseRepository
    extends BaseMongooseRepository<ThreatActor, ThreatActorDoc>
    implements ThreatActorRepository
{
    constructor(
        @InjectModel(ThreatActorDocument.name)
        model: Model<ThreatActorDoc>,
    ) {
        super(model);
    }

    async findByName(name: string): Promise<ThreatActor | null> {
        const doc = await this.model.findOne({ name }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    protected toDomain(doc: ThreatActorDoc): ThreatActor {
        return new ThreatActor({
            id: doc.domainId,
            name: doc.name,
            description: doc.description,
            threatActorTypes:
                doc.threatActorTypes as unknown as ThreatActorType[],
            aliases: doc.aliases as unknown as string[],
            firstSeen: doc.firstSeen,
            lastSeen: doc.lastSeen,
            roles: doc.roles as unknown as ThreatActorRole[],
            goals: doc.goals,
            sophistication: doc.sophistication as
                | ThreatActorSophistication
                | undefined,
            resourceLevel: doc.resourceLevel as ResourceLevel | undefined,
            primaryMotivations:
                doc.primaryMotivations as unknown as AttackMotivation[],
            secondaryMotivations:
                doc.secondaryMotivations as unknown as AttackMotivation[],
            personalMotivations: doc.personalMotivations,
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

    protected toPersistence(entity: ThreatActor): Record<string, unknown> {
        return {
            domainId: entity.id,
            name: entity.name,
            description: entity.description,
            threatActorTypes: entity.threatActorTypes,
            aliases: entity.aliases,
            firstSeen: entity.firstSeen,
            lastSeen: entity.lastSeen,
            roles: entity.roles,
            goals: entity.goals,
            sophistication: entity.sophistication,
            resourceLevel: entity.resourceLevel,
            primaryMotivations: entity.primaryMotivations,
            secondaryMotivations: entity.secondaryMotivations,
            personalMotivations: entity.personalMotivations,
            confidence: entity.confidence,
            revoked: entity.revoked,
            externalReferences: entity.externalReferences,
            tlp: entity.tlp,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
}
