import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseMongooseRepository } from '../../../../shared/infrastructure/persistence/base-mongoose.repository';
import { ObservedData, ObservedDataRepository, TLP } from '../../../domain';
import {
    ObservedDataDoc,
    ObservedDataDocument,
} from '../schemas/observed-data.schema';

@Injectable()
export class ObservedDataMongooseRepository
    extends BaseMongooseRepository<
        ObservedData,
        ObservedDataDoc,
        Partial<{ tlp: string }>
    >
    implements ObservedDataRepository
{
    constructor(
        @InjectModel(ObservedDataDocument.name)
        model: Model<ObservedDataDoc>,
    ) {
        super(model);
    }

    protected toDomain(doc: ObservedDataDoc): ObservedData {
        return new ObservedData({
            id: doc.domainId,
            firstObserved: doc.firstObserved,
            lastObserved: doc.lastObserved,
            numberObserved: doc.numberObserved,
            objectRefs: doc.objectRefs as unknown as string[],
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

    protected toPersistence(entity: ObservedData): Record<string, unknown> {
        return {
            domainId: entity.id,
            firstObserved: entity.firstObserved,
            lastObserved: entity.lastObserved,
            numberObserved: entity.numberObserved,
            objectRefs: entity.objectRefs,
            confidence: entity.confidence,
            revoked: entity.revoked,
            externalReferences: entity.externalReferences,
            tlp: entity.tlp,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
}
