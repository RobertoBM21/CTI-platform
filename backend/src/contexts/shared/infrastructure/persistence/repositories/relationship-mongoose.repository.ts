import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
    Relationship,
    RelationshipRepository,
    RelationshipType,
    TLP,
} from '../../../domain';
import { BaseMongooseRepository } from '../base-mongoose.repository';
import {
    RelationshipDoc,
    RelationshipDocument,
} from '../schemas/relationship.schema';

type RelationshipFilter = Partial<{
    relationshipType: string;
    sourceRef: string;
    targetRef: string;
    tlp: string;
}>;

@Injectable()
export class RelationshipMongooseRepository
    extends BaseMongooseRepository<
        Relationship,
        RelationshipDoc,
        RelationshipFilter
    >
    implements RelationshipRepository
{
    constructor(
        @InjectModel(RelationshipDocument.name)
        model: Model<RelationshipDoc>,
    ) {
        super(model);
    }

    async findBySourceRef(sourceRef: string): Promise<Relationship[]> {
        const docs = await this.model.find({ sourceRef }).exec();
        return docs.map((doc) => this.toDomain(doc));
    }

    async findByTargetRef(targetRef: string): Promise<Relationship[]> {
        const docs = await this.model.find({ targetRef }).exec();
        return docs.map((doc) => this.toDomain(doc));
    }

    protected toDomain(doc: RelationshipDoc): Relationship {
        return new Relationship({
            id: doc.domainId,
            relationshipType: doc.relationshipType as RelationshipType,
            description: doc.description,
            sourceRef: doc.sourceRef,
            targetRef: doc.targetRef,
            startTime: doc.startTime,
            stopTime: doc.stopTime,
            tlp: doc.tlp as TLP,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    protected toPersistence(entity: Relationship): Record<string, unknown> {
        return {
            domainId: entity.id,
            relationshipType: entity.relationshipType,
            description: entity.description,
            sourceRef: entity.sourceRef,
            targetRef: entity.targetRef,
            startTime: entity.startTime,
            stopTime: entity.stopTime,
            tlp: entity.tlp,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
}
