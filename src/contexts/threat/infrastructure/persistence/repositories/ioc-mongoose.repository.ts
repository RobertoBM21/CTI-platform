import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
    Ioc,
    IocRepository,
    IocSourceType,
    IocType,
    TLP,
} from '../../../domain';
import { IocDoc, IocDocument } from '../schemas/ioc.schema';

@Injectable()
export class IocMongooseRepository extends IocRepository {
    constructor(
        @InjectModel(IocDocument.name)
        private readonly iocModel: Model<IocDoc>,
    ) {
        super();
    }

    async findById(id: string): Promise<Ioc | null> {
        const doc = await this.iocModel.findOne({ domainId: id }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    async findAll(
        filter: Partial<{ type: string; value: string; tlp: string }>,
        page: number,
        limit: number,
    ) {
        const safePage = Math.max(1, page);
        const safeLimit = Math.max(1, limit);
        const query: Record<string, unknown> = {};

        if (filter.type) {
            query.type = filter.type;
        }

        if (filter.value) {
            query.value = { $regex: filter.value, $options: 'i' };
        }

        if (filter.tlp) {
            query.tlp = filter.tlp;
        }

        const [docs, total] = await Promise.all([
            this.iocModel
                .find(query)
                .sort({ createdAt: -1 })
                .skip((safePage - 1) * safeLimit)
                .limit(safeLimit)
                .exec(),
            this.iocModel.countDocuments(query).exec(),
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

    async findBySource(
        sourceType: IocSourceType,
        sourceId: string,
        page: number,
        limit: number,
    ) {
        const safePage = Math.max(1, page);
        const safeLimit = Math.max(1, limit);
        const query = { sourceType, sourceId };

        const [docs, total] = await Promise.all([
            this.iocModel
                .find(query)
                .sort({ createdAt: -1 })
                .skip((safePage - 1) * safeLimit)
                .limit(safeLimit)
                .exec(),
            this.iocModel.countDocuments(query).exec(),
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

    async findByValue(value: string): Promise<Ioc[]> {
        const docs = await this.iocModel
            .find({ value })
            .sort({ createdAt: -1 })
            .exec();
        return docs.map((doc) => this.toDomain(doc));
    }

    async create(entity: Ioc): Promise<Ioc> {
        const doc = await this.iocModel.create(this.toPersistence(entity));
        return this.toDomain(doc);
    }

    async update(id: string, entity: Partial<Ioc>): Promise<Ioc | null> {
        const doc = await this.iocModel
            .findOneAndUpdate(
                { domainId: id },
                this.toPersistencePartial(entity),
                {
                    new: true,
                },
            )
            .exec();

        return doc ? this.toDomain(doc) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.iocModel.deleteOne({ domainId: id }).exec();
        return result.deletedCount > 0;
    }

    private toDomain(doc: IocDoc): Ioc {
        return new Ioc({
            id: doc.domainId,
            type: doc.type as IocType,
            value: doc.value,
            description: doc.description,
            tags: doc.tags as unknown as string[],
            tlp: doc.tlp as TLP,
            sourceType: doc.sourceType as IocSourceType,
            sourceId: doc.sourceId,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    private toPersistence(entity: Ioc): Record<string, unknown> {
        return {
            domainId: entity.id,
            type: entity.type,
            value: entity.value,
            description: entity.description,
            tags: entity.tags,
            tlp: entity.tlp,
            sourceType: entity.sourceType,
            sourceId: entity.sourceId,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }

    private toPersistencePartial(
        entity: Partial<Ioc>,
    ): Record<string, unknown> {
        const update: Record<string, unknown> = { updatedAt: new Date() };

        if (entity.type !== undefined) update.type = entity.type;
        if (entity.value !== undefined) update.value = entity.value;
        if (entity.description !== undefined)
            update.description = entity.description;
        if (entity.tags !== undefined) update.tags = entity.tags;
        if (entity.tlp !== undefined) update.tlp = entity.tlp;
        if (entity.sourceType !== undefined)
            update.sourceType = entity.sourceType;
        if (entity.sourceId !== undefined) update.sourceId = entity.sourceId;

        return update;
    }
}
