import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SortCriteria } from '../../../../shared/application/dtos/sort.dto';
import { Opinion, OpinionRepository, OpinionValue, TLP } from '../../../domain';
import { OpinionDoc, OpinionDocument } from '../schemas/opinion.schema';

@Injectable()
export class OpinionMongooseRepository extends OpinionRepository {
    constructor(
        @InjectModel(OpinionDocument.name)
        private readonly opinionModel: Model<OpinionDoc>,
    ) {
        super();
    }

    async findById(id: string): Promise<Opinion | null> {
        const doc = await this.opinionModel.findOne({ domainId: id }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    async findAll(
        filter: Partial<{ tlp: string }>,
        page: number,
        limit: number,
        sort: SortCriteria,
    ) {
        const safePage = Math.max(1, page);
        const safeLimit = Math.max(1, limit);
        const query: Record<string, unknown> = {};
        const sortQuery = { [sort.field]: sort.direction };

        if (filter.tlp) {
            query.tlp = filter.tlp;
        }

        const [docs, total] = await Promise.all([
            this.opinionModel
                .find(query)
                .sort(sortQuery)
                .skip((safePage - 1) * safeLimit)
                .limit(safeLimit)
                .exec(),
            this.opinionModel.countDocuments(query).exec(),
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

    async create(entity: Opinion): Promise<Opinion> {
        const doc = await this.opinionModel.create(this.toPersistence(entity));
        return this.toDomain(doc);
    }

    async update(
        id: string,
        entity: Partial<Opinion>,
    ): Promise<Opinion | null> {
        const doc = await this.opinionModel
            .findOneAndUpdate(
                { domainId: id },
                this.toPersistencePartial(entity),
                { new: true },
            )
            .exec();
        return doc ? this.toDomain(doc) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.opinionModel
            .deleteOne({ domainId: id })
            .exec();
        return result.deletedCount > 0;
    }

    private toDomain(doc: OpinionDoc): Opinion {
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

    private toPersistence(entity: Opinion): Record<string, unknown> {
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

    private toPersistencePartial(
        entity: Partial<Opinion>,
    ): Record<string, unknown> {
        const update: Record<string, unknown> = { updatedAt: new Date() };

        if (entity.opinion !== undefined) update.opinion = entity.opinion;
        if (entity.objectRefs !== undefined)
            update.objectRefs = entity.objectRefs;
        if (entity.explanation !== undefined)
            update.explanation = entity.explanation;
        if (entity.authors !== undefined) update.authors = entity.authors;
        if (entity.confidence !== undefined)
            update.confidence = entity.confidence;
        if (entity.revoked !== undefined) update.revoked = entity.revoked;
        if (entity.externalReferences !== undefined)
            update.externalReferences = entity.externalReferences;
        if (entity.tlp !== undefined) update.tlp = entity.tlp;

        return update;
    }
}
