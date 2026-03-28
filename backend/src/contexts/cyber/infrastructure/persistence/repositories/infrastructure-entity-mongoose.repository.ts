import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SortCriteria } from '../../../../shared/application/dtos/sort.dto';
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
export class InfrastructureEntityMongooseRepository extends InfrastructureEntityRepository {
    constructor(
        @InjectModel(InfrastructureEntityDocument.name)
        private readonly infrastructureModel: Model<InfrastructureEntityDoc>,
    ) {
        super();
    }

    async findById(id: string): Promise<InfrastructureEntity | null> {
        const doc = await this.infrastructureModel
            .findOne({ domainId: id })
            .exec();
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
            this.infrastructureModel
                .find(query)
                .sort(sortQuery)
                .skip((safePage - 1) * safeLimit)
                .limit(safeLimit)
                .exec(),
            this.infrastructureModel.countDocuments(query).exec(),
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

    async findByName(name: string): Promise<InfrastructureEntity | null> {
        const doc = await this.infrastructureModel.findOne({ name }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    async create(entity: InfrastructureEntity): Promise<InfrastructureEntity> {
        const doc = await this.infrastructureModel.create(
            this.toPersistence(entity),
        );
        return this.toDomain(doc);
    }

    async update(
        id: string,
        entity: Partial<InfrastructureEntity>,
    ): Promise<InfrastructureEntity | null> {
        const doc = await this.infrastructureModel
            .findOneAndUpdate(
                { domainId: id },
                this.toPersistencePartial(entity),
                { new: true },
            )
            .exec();
        return doc ? this.toDomain(doc) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.infrastructureModel
            .deleteOne({ domainId: id })
            .exec();
        return result.deletedCount > 0;
    }

    private toDomain(doc: InfrastructureEntityDoc): InfrastructureEntity {
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

    private toPersistence(
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

    private toPersistencePartial(
        entity: Partial<InfrastructureEntity>,
    ): Record<string, unknown> {
        const update: Record<string, unknown> = { updatedAt: new Date() };

        if (entity.name !== undefined) update.name = entity.name;
        if (entity.description !== undefined)
            update.description = entity.description;
        if (entity.infrastructureTypes !== undefined)
            update.infrastructureTypes = entity.infrastructureTypes;
        if (entity.killChainPhases !== undefined)
            update.killChainPhases = entity.killChainPhases;
        if (entity.aliases !== undefined) update.aliases = entity.aliases;
        if (entity.firstSeen !== undefined) update.firstSeen = entity.firstSeen;
        if (entity.lastSeen !== undefined) update.lastSeen = entity.lastSeen;
        if (entity.confidence !== undefined)
            update.confidence = entity.confidence;
        if (entity.revoked !== undefined) update.revoked = entity.revoked;
        if (entity.externalReferences !== undefined)
            update.externalReferences = entity.externalReferences;
        if (entity.tlp !== undefined) update.tlp = entity.tlp;

        return update;
    }
}
