import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
    AttackMotivation,
    Campaign,
    CampaignRepository,
    TLP,
} from '../../../domain';
import { CampaignDoc, CampaignDocument } from '../schemas/campaign.schema';

@Injectable()
export class CampaignMongooseRepository extends CampaignRepository {
    constructor(
        @InjectModel(CampaignDocument.name)
        private readonly campaignModel: Model<CampaignDoc>,
    ) {
        super();
    }

    async findById(id: string): Promise<Campaign | null> {
        const doc = await this.campaignModel.findOne({ domainId: id }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    async findAll(
        filter: Partial<{ name: string; tlp: string }>,
        page: number,
        limit: number,
    ) {
        const safePage = Math.max(1, page);
        const safeLimit = Math.max(1, limit);
        const query: Record<string, unknown> = {};

        if (filter.name) {
            query.name = { $regex: filter.name, $options: 'i' };
        }

        if (filter.tlp) {
            query.tlp = filter.tlp;
        }

        const [docs, total] = await Promise.all([
            this.campaignModel
                .find(query)
                .sort({ createdAt: -1 })
                .skip((safePage - 1) * safeLimit)
                .limit(safeLimit)
                .exec(),
            this.campaignModel.countDocuments(query).exec(),
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

    async findByThreatActorId(threatActorId: string): Promise<Campaign[]> {
        const docs = await this.campaignModel
            .find({ threatActorIds: threatActorId })
            .sort({ createdAt: -1 })
            .exec();

        return docs.map((doc) => this.toDomain(doc));
    }

    async create(entity: Campaign): Promise<Campaign> {
        const doc = await this.campaignModel.create(this.toPersistence(entity));
        return this.toDomain(doc);
    }

    async update(
        id: string,
        entity: Partial<Campaign>,
    ): Promise<Campaign | null> {
        const doc = await this.campaignModel
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
        const result = await this.campaignModel
            .deleteOne({ domainId: id })
            .exec();
        return result.deletedCount > 0;
    }

    private toDomain(doc: CampaignDoc): Campaign {
        return new Campaign({
            id: doc.domainId,
            name: doc.name,
            description: doc.description,
            aliases: doc.aliases as unknown as string[],
            firstSeen: doc.firstSeen,
            lastSeen: doc.lastSeen,
            objective: doc.objective,
            primaryMotivations:
                doc.primaryMotivations as unknown as AttackMotivation[],
            secondaryMotivations:
                doc.secondaryMotivations as unknown as AttackMotivation[],
            tlp: doc.tlp as TLP,
            threatActorIds: doc.threatActorIds as unknown as string[],
            attackPatternIds: doc.attackPatternIds as unknown as string[],
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    private toPersistence(entity: Campaign): Record<string, unknown> {
        return {
            domainId: entity.id,
            name: entity.name,
            description: entity.description,
            aliases: entity.aliases,
            firstSeen: entity.firstSeen,
            lastSeen: entity.lastSeen,
            objective: entity.objective,
            primaryMotivations: entity.primaryMotivations,
            secondaryMotivations: entity.secondaryMotivations,
            tlp: entity.tlp,
            threatActorIds: entity.threatActorIds,
            attackPatternIds: entity.attackPatternIds,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }

    private toPersistencePartial(
        entity: Partial<Campaign>,
    ): Record<string, unknown> {
        const update: Record<string, unknown> = { updatedAt: new Date() };

        if (entity.name !== undefined) update.name = entity.name;
        if (entity.description !== undefined)
            update.description = entity.description;
        if (entity.aliases !== undefined) update.aliases = entity.aliases;
        if (entity.firstSeen !== undefined) update.firstSeen = entity.firstSeen;
        if (entity.lastSeen !== undefined) update.lastSeen = entity.lastSeen;
        if (entity.objective !== undefined) update.objective = entity.objective;
        if (entity.primaryMotivations !== undefined)
            update.primaryMotivations = entity.primaryMotivations;
        if (entity.secondaryMotivations !== undefined)
            update.secondaryMotivations = entity.secondaryMotivations;
        if (entity.tlp !== undefined) update.tlp = entity.tlp;
        if (entity.threatActorIds !== undefined)
            update.threatActorIds = entity.threatActorIds;
        if (entity.attackPatternIds !== undefined)
            update.attackPatternIds = entity.attackPatternIds;

        return update;
    }
}
