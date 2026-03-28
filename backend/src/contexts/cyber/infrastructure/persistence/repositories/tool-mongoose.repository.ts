import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SortCriteria } from '../../../../shared/application/dtos/sort.dto';
import { TLP, Tool, ToolRepository, ToolType } from '../../../domain';
import { ToolDoc, ToolDocument } from '../schemas/tool.schema';

@Injectable()
export class ToolMongooseRepository extends ToolRepository {
    constructor(
        @InjectModel(ToolDocument.name)
        private readonly toolModel: Model<ToolDoc>,
    ) {
        super();
    }

    async findById(id: string): Promise<Tool | null> {
        const doc = await this.toolModel.findOne({ domainId: id }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    async findAll(
        filter: Partial<{ name: string; tlp: string }>,
        page: number,
        limit: number,
        sort: SortCriteria,
    ) {
        const safePage = Math.max(1, page);
        const safeLimit = Math.max(1, limit);
        const query: Record<string, unknown> = {};
        const sortQuery = { [sort.field]: sort.direction };

        if (filter.name) {
            query.name = { $regex: filter.name, $options: 'i' };
        }

        if (filter.tlp) {
            query.tlp = filter.tlp;
        }

        const [docs, total] = await Promise.all([
            this.toolModel
                .find(query)
                .sort(sortQuery)
                .skip((safePage - 1) * safeLimit)
                .limit(safeLimit)
                .exec(),
            this.toolModel.countDocuments(query).exec(),
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

    async findByName(name: string): Promise<Tool | null> {
        const doc = await this.toolModel.findOne({ name }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    async create(entity: Tool): Promise<Tool> {
        const doc = await this.toolModel.create(this.toPersistence(entity));
        return this.toDomain(doc);
    }

    async update(id: string, entity: Partial<Tool>): Promise<Tool | null> {
        const doc = await this.toolModel
            .findOneAndUpdate(
                { domainId: id },
                this.toPersistencePartial(entity),
                { new: true },
            )
            .exec();
        return doc ? this.toDomain(doc) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.toolModel.deleteOne({ domainId: id }).exec();
        return result.deletedCount > 0;
    }

    private toDomain(doc: ToolDoc): Tool {
        return new Tool({
            id: doc.domainId,
            name: doc.name,
            description: doc.description,
            toolTypes: doc.toolTypes as unknown as ToolType[],
            killChainPhases: doc.killChainPhases.map((p) => ({
                killChainName: p.killChainName,
                phaseName: p.phaseName,
            })),
            toolVersion: doc.toolVersion,
            aliases: doc.aliases as unknown as string[],
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

    private toPersistence(entity: Tool): Record<string, unknown> {
        return {
            domainId: entity.id,
            name: entity.name,
            description: entity.description,
            toolTypes: entity.toolTypes,
            killChainPhases: entity.killChainPhases,
            toolVersion: entity.toolVersion,
            aliases: entity.aliases,
            confidence: entity.confidence,
            revoked: entity.revoked,
            externalReferences: entity.externalReferences,
            tlp: entity.tlp,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }

    private toPersistencePartial(
        entity: Partial<Tool>,
    ): Record<string, unknown> {
        const update: Record<string, unknown> = { updatedAt: new Date() };

        if (entity.name !== undefined) update.name = entity.name;
        if (entity.description !== undefined)
            update.description = entity.description;
        if (entity.toolTypes !== undefined) update.toolTypes = entity.toolTypes;
        if (entity.killChainPhases !== undefined)
            update.killChainPhases = entity.killChainPhases;
        if (entity.toolVersion !== undefined)
            update.toolVersion = entity.toolVersion;
        if (entity.aliases !== undefined) update.aliases = entity.aliases;
        if (entity.confidence !== undefined)
            update.confidence = entity.confidence;
        if (entity.revoked !== undefined) update.revoked = entity.revoked;
        if (entity.externalReferences !== undefined)
            update.externalReferences = entity.externalReferences;
        if (entity.tlp !== undefined) update.tlp = entity.tlp;

        return update;
    }
}
