import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseMongooseRepository } from '../../../../shared/infrastructure/persistence/base-mongoose.repository';
import {
    InfrastructureEntity,
    InfrastructureEntityRepository,
    InfrastructureType,
    TLP,
} from '../../../domain';
import {
    InfrastructureEntityDoc,
    InfrastructureEntityDocument,
} from '../schemas/infrastructure-entity.schema';

@Injectable()
export class InfrastructureEntityMongooseRepository
    extends BaseMongooseRepository<
        InfrastructureEntity,
        InfrastructureEntityDoc
    >
    implements InfrastructureEntityRepository
{
    constructor(
        @InjectModel(InfrastructureEntityDocument.name)
        model: Model<InfrastructureEntityDoc>,
    ) {
        super(model);
    }

    async findByName(name: string): Promise<InfrastructureEntity | null> {
        const doc = await this.model.findOne({ name }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    protected toDomain(doc: InfrastructureEntityDoc): InfrastructureEntity {
        return new InfrastructureEntity({
            id: doc.domainId,
            name: doc.name,
            description: doc.description,
            infrastructureTypes:
                doc.infrastructureTypes as unknown as InfrastructureType[],
            killChainPhases: doc.killChainPhases.map((p) => ({
                killChainName: p.killChainName,
                phaseName: p.phaseName,
            })),
            aliases: doc.aliases as unknown as string[],
            firstSeen: doc.firstSeen,
            lastSeen: doc.lastSeen,
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

    protected toPersistence(
        entity: InfrastructureEntity,
    ): Record<string, unknown> {
        return {
            domainId: entity.id,
            name: entity.name,
            description: entity.description,
            infrastructureTypes: entity.infrastructureTypes,
            killChainPhases: entity.killChainPhases,
            aliases: entity.aliases,
            firstSeen: entity.firstSeen,
            lastSeen: entity.lastSeen,
            confidence: entity.confidence,
            revoked: entity.revoked,
            externalReferences: entity.externalReferences,
            tlp: entity.tlp,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
}
