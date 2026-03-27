import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SortCriteria } from '../../../application/dtos/sort.dto';
import {
    Relationship,
    RelationshipRepository,
    RelationshipType,
    TLP,
} from '../../../domain';
import {
    RelationshipDoc,
    RelationshipDocument,
} from '../schemas/relationship.schema';

@Injectable()
export class RelationshipMongooseRepository extends RelationshipRepository {
    constructor(
        @InjectModel(RelationshipDocument.name)
        private readonly relationshipModel: Model<RelationshipDoc>,
    ) {
        super();
    }

    async findById(id: string): Promise<Relationship | null> {
        const doc = await this.relationshipModel
            .findOne({ domainId: id })
            .exec();
        return doc ? this.toDomain(doc) : null;
    }

    async findAll(
        filter: Partial<{
            relationshipType: string;
            sourceRef: string;
            targetRef: string;
            tlp: string;
        }>,
        page: number,
        limit: number,
        sort: SortCriteria,
    ) {
        const safePage = Math.max(1, page);
        const safeLimit = Math.max(1, limit);
        const query: Record<string, unknown> = {};
        const sortQuery = { [sort.field]: sort.direction };

        if (filter.relationshipType) {
            query.relationshipType = filter.relationshipType;
        }

        if (filter.sourceRef) {
            query.sourceRef = filter.sourceRef;
        }

        if (filter.targetRef) {
            query.targetRef = filter.targetRef;
        }

        if (filter.tlp) {
            query.tlp = filter.tlp;
        }

        const [docs, total] = await Promise.all([
            this.relationshipModel
                .find(query)
                .sort(sortQuery)
                .skip((safePage - 1) * safeLimit)
                .limit(safeLimit)
                .exec(),
            this.relationshipModel.countDocuments(query).exec(),
        ]);

        return {
            data: docs.map((doc) => this.toDomain(doc)),
            meta: {
                total,
                page: safePage,
                limit: safeLimit,
                totalPages: Math.ceil(total / safeLimit),
            },
        };
    }

    async findBySourceRef(sourceRef: string): Promise<Relationship[]> {
        const docs = await this.relationshipModel.find({ sourceRef }).exec();
        return docs.map((doc) => this.toDomain(doc));
    }

    async findByTargetRef(targetRef: string): Promise<Relationship[]> {
        const docs = await this.relationshipModel.find({ targetRef }).exec();
        return docs.map((doc) => this.toDomain(doc));
    }

    async create(entity: Relationship): Promise<Relationship> {
        const doc = await this.relationshipModel.create(
            this.toPersistence(entity),
        );
        return this.toDomain(doc);
    }

    async update(
        id: string,
        entity: Partial<Relationship>,
    ): Promise<Relationship | null> {
        const doc = await this.relationshipModel
            .findOneAndUpdate(
                { domainId: id },
                this.toPersistencePartial(entity),
                { new: true },
            )
            .exec();

        return doc ? this.toDomain(doc) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.relationshipModel
            .deleteOne({ domainId: id })
            .exec();
        return result.deletedCount > 0;
    }

    private toDomain(doc: RelationshipDoc): Relationship {
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

    private toPersistence(entity: Relationship): Record<string, unknown> {
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

    private toPersistencePartial(
        entity: Partial<Relationship>,
    ): Record<string, unknown> {
        const update: Record<string, unknown> = { updatedAt: new Date() };

        if (entity.relationshipType !== undefined)
            update.relationshipType = entity.relationshipType;
        if (entity.description !== undefined)
            update.description = entity.description;
        if (entity.sourceRef !== undefined) update.sourceRef = entity.sourceRef;
        if (entity.targetRef !== undefined) update.targetRef = entity.targetRef;
        if (entity.startTime !== undefined) update.startTime = entity.startTime;
        if (entity.stopTime !== undefined) update.stopTime = entity.stopTime;
        if (entity.tlp !== undefined) update.tlp = entity.tlp;

        return update;
    }
}
