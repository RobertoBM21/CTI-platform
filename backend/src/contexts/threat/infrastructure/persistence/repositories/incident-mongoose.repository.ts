import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SortCriteria } from '../../../../shared/application/dtos/sort.dto';
import { Incident, IncidentRepository, TLP } from '../../../domain';
import { IncidentDoc, IncidentDocument } from '../schemas/incident.schema';

@Injectable()
export class IncidentMongooseRepository extends IncidentRepository {
    constructor(
        @InjectModel(IncidentDocument.name)
        private readonly incidentModel: Model<IncidentDoc>,
    ) {
        super();
    }

    async findById(id: string): Promise<Incident | null> {
        const doc = await this.incidentModel.findOne({ domainId: id }).exec();
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
            this.incidentModel
                .find(query)
                .sort(sortQuery)
                .skip((safePage - 1) * safeLimit)
                .limit(safeLimit)
                .exec(),
            this.incidentModel.countDocuments(query).exec(),
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

    async findByCampaignId(campaignId: string): Promise<Incident[]> {
        const docs = await this.incidentModel
            .find({ campaignId })
            .sort({ createdAt: -1 })
            .exec();
        return docs.map((doc) => this.toDomain(doc));
    }

    async findByThreatActorId(threatActorId: string): Promise<Incident[]> {
        const docs = await this.incidentModel
            .find({ threatActorIds: threatActorId })
            .sort({ createdAt: -1 })
            .exec();
        return docs.map((doc) => this.toDomain(doc));
    }

    async create(entity: Incident): Promise<Incident> {
        const doc = await this.incidentModel.create(this.toPersistence(entity));
        return this.toDomain(doc);
    }

    async update(
        id: string,
        entity: Partial<Incident>,
    ): Promise<Incident | null> {
        const doc = await this.incidentModel
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
        const result = await this.incidentModel
            .deleteOne({ domainId: id })
            .exec();
        return result.deletedCount > 0;
    }

    private toDomain(doc: IncidentDoc): Incident {
        return new Incident({
            id: doc.domainId,
            name: doc.name,
            description: doc.description,
            firstSeen: doc.firstSeen,
            lastSeen: doc.lastSeen,
            objective: doc.objective,
            tlp: doc.tlp as TLP,
            threatActorIds: doc.threatActorIds as unknown as string[],
            campaignId: doc.campaignId,
            attackPatternIds: doc.attackPatternIds as unknown as string[],
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    private toPersistence(entity: Incident): Record<string, unknown> {
        return {
            domainId: entity.id,
            name: entity.name,
            description: entity.description,
            firstSeen: entity.firstSeen,
            lastSeen: entity.lastSeen,
            objective: entity.objective,
            tlp: entity.tlp,
            threatActorIds: entity.threatActorIds,
            campaignId: entity.campaignId,
            attackPatternIds: entity.attackPatternIds,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }

    private toPersistencePartial(
        entity: Partial<Incident>,
    ): Record<string, unknown> {
        const update: Record<string, unknown> = { updatedAt: new Date() };

        if (entity.name !== undefined) update.name = entity.name;
        if (entity.description !== undefined)
            update.description = entity.description;
        if (entity.firstSeen !== undefined) update.firstSeen = entity.firstSeen;
        if (entity.lastSeen !== undefined) update.lastSeen = entity.lastSeen;
        if (entity.objective !== undefined) update.objective = entity.objective;
        if (entity.tlp !== undefined) update.tlp = entity.tlp;
        if (entity.threatActorIds !== undefined)
            update.threatActorIds = entity.threatActorIds;
        if (entity.campaignId !== undefined)
            update.campaignId = entity.campaignId;
        if (entity.attackPatternIds !== undefined)
            update.attackPatternIds = entity.attackPatternIds;

        return update;
    }
}
