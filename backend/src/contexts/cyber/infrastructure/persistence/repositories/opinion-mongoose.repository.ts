import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseMongooseRepository } from '../../../../shared/infrastructure/persistence/base-mongoose.repository';
import { Opinion, OpinionRepository, OpinionValue, TLP } from '../../../domain';
import { OpinionDoc, OpinionDocument } from '../schemas/opinion.schema';

@Injectable()
export class OpinionMongooseRepository
    extends BaseMongooseRepository<
        Opinion,
        OpinionDoc,
        Partial<{ tlp: string }>
    >
    implements OpinionRepository
{
    constructor(
        @InjectModel(OpinionDocument.name)
        model: Model<OpinionDoc>,
    ) {
        super(model);
    }

    protected toDomain(doc: OpinionDoc): Opinion {
        return new Opinion({
            id: doc.domainId,
            opinion: doc.opinion as OpinionValue,
            objectRefs: doc.objectRefs as unknown as string[],
            explanation: doc.explanation,
            authors: doc.authors as unknown as string[],
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

    protected toPersistence(entity: Opinion): Record<string, unknown> {
        return {
            domainId: entity.id,
            opinion: entity.opinion,
            objectRefs: entity.objectRefs,
            explanation: entity.explanation,
            authors: entity.authors,
            confidence: entity.confidence,
            revoked: entity.revoked,
            externalReferences: entity.externalReferences,
            tlp: entity.tlp,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
}
