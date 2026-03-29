import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseMongooseRepository } from '../../../../shared/infrastructure/persistence/base-mongoose.repository';
import { AttackPattern, AttackPatternRepository, TLP } from '../../../domain';
import {
    AttackPatternDoc,
    AttackPatternDocument,
} from '../schemas/attack-pattern.schema';

@Injectable()
export class AttackPatternMongooseRepository
    extends BaseMongooseRepository<AttackPattern, AttackPatternDoc>
    implements AttackPatternRepository
{
    constructor(
        @InjectModel(AttackPatternDocument.name)
        model: Model<AttackPatternDoc>,
    ) {
        super(model);
    }

    async findByExternalReference(ref: string): Promise<AttackPattern | null> {
        const doc = await this.model.findOne({ externalReference: ref }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    protected toDomain(doc: AttackPatternDoc): AttackPattern {
        return new AttackPattern({
            id: doc.domainId,
            name: doc.name,
            description: doc.description,
            aliases: doc.aliases as unknown as string[],
            externalReference: doc.externalReference,
            killChainPhase: doc.killChainPhase,
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

    protected toPersistence(entity: AttackPattern): Record<string, unknown> {
        return {
            domainId: entity.id,
            name: entity.name,
            description: entity.description,
            aliases: entity.aliases,
            externalReference: entity.externalReference,
            killChainPhase: entity.killChainPhase,
            confidence: entity.confidence,
            revoked: entity.revoked,
            externalReferences: entity.externalReferences,
            tlp: entity.tlp,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
}
