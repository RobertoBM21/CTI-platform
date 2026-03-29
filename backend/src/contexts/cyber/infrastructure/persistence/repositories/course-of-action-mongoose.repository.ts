import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseMongooseRepository } from '../../../../shared/infrastructure/persistence/base-mongoose.repository';
import { CourseOfAction, CourseOfActionRepository, TLP } from '../../../domain';
import {
    CourseOfActionDoc,
    CourseOfActionDocument,
} from '../schemas/course-of-action.schema';

@Injectable()
export class CourseOfActionMongooseRepository
    extends BaseMongooseRepository<CourseOfAction, CourseOfActionDoc>
    implements CourseOfActionRepository
{
    constructor(
        @InjectModel(CourseOfActionDocument.name)
        model: Model<CourseOfActionDoc>,
    ) {
        super(model);
    }

    async findByName(name: string): Promise<CourseOfAction | null> {
        const doc = await this.model.findOne({ name }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    protected toDomain(doc: CourseOfActionDoc): CourseOfAction {
        return new CourseOfAction({
            id: doc.domainId,
            name: doc.name,
            description: doc.description,
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

    protected toPersistence(entity: CourseOfAction): Record<string, unknown> {
        return {
            domainId: entity.id,
            name: entity.name,
            description: entity.description,
            confidence: entity.confidence,
            revoked: entity.revoked,
            externalReferences: entity.externalReferences,
            tlp: entity.tlp,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
}
