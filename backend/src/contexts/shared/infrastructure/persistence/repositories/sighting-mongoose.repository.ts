import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SortCriteria } from '../../../application/dtos/sort.dto';
import { Sighting, SightingRepository, TLP } from '../../../domain';
import { SightingDoc, SightingDocument } from '../schemas/sighting.schema';

@Injectable()
export class SightingMongooseRepository extends SightingRepository {
    constructor(
        @InjectModel(SightingDocument.name)
        private readonly sightingModel: Model<SightingDoc>,
    ) {
        super();
    }

    async findById(id: string): Promise<Sighting | null> {
        const doc = await this.sightingModel.findOne({ domainId: id }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    async findAll(
        filter: Partial<{
            sightingOfRef: string;
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

        if (filter.sightingOfRef) {
            query.sightingOfRef = filter.sightingOfRef;
        }

        if (filter.tlp) {
            query.tlp = filter.tlp;
        }

        const [docs, total] = await Promise.all([
            this.sightingModel
                .find(query)
                .sort(sortQuery)
                .skip((safePage - 1) * safeLimit)
                .limit(safeLimit)
                .exec(),
            this.sightingModel.countDocuments(query).exec(),
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

    async findBySightingOfRef(sightingOfRef: string): Promise<Sighting[]> {
        const docs = await this.sightingModel.find({ sightingOfRef }).exec();
        return docs.map((doc) => this.toDomain(doc));
    }

    async create(entity: Sighting): Promise<Sighting> {
        const doc = await this.sightingModel.create(this.toPersistence(entity));
        return this.toDomain(doc);
    }

    async update(
        id: string,
        entity: Partial<Sighting>,
    ): Promise<Sighting | null> {
        const doc = await this.sightingModel
            .findOneAndUpdate(
                { domainId: id },
                this.toPersistencePartial(entity),
                { new: true },
            )
            .exec();

        return doc ? this.toDomain(doc) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.sightingModel
            .deleteOne({ domainId: id })
            .exec();
        return result.deletedCount > 0;
    }

    private toDomain(doc: SightingDoc): Sighting {
        return new Sighting({
            id: doc.domainId,
            description: doc.description,
            firstSeen: doc.firstSeen,
            lastSeen: doc.lastSeen,
            count: doc.count,
            sightingOfRef: doc.sightingOfRef,
            observedDataRefs: doc.observedDataRefs as unknown as string[],
            whereSightedRefs: doc.whereSightedRefs as unknown as string[],
            tlp: doc.tlp as TLP,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    private toPersistence(entity: Sighting): Record<string, unknown> {
        return {
            domainId: entity.id,
            description: entity.description,
            firstSeen: entity.firstSeen,
            lastSeen: entity.lastSeen,
            count: entity.count,
            sightingOfRef: entity.sightingOfRef,
            observedDataRefs: entity.observedDataRefs,
            whereSightedRefs: entity.whereSightedRefs,
            tlp: entity.tlp,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }

    private toPersistencePartial(
        entity: Partial<Sighting>,
    ): Record<string, unknown> {
        const update: Record<string, unknown> = { updatedAt: new Date() };

        if (entity.description !== undefined)
            update.description = entity.description;
        if (entity.firstSeen !== undefined) update.firstSeen = entity.firstSeen;
        if (entity.lastSeen !== undefined) update.lastSeen = entity.lastSeen;
        if (entity.count !== undefined) update.count = entity.count;
        if (entity.sightingOfRef !== undefined)
            update.sightingOfRef = entity.sightingOfRef;
        if (entity.observedDataRefs !== undefined)
            update.observedDataRefs = entity.observedDataRefs;
        if (entity.whereSightedRefs !== undefined)
            update.whereSightedRefs = entity.whereSightedRefs;
        if (entity.tlp !== undefined) update.tlp = entity.tlp;

        return update;
    }
}
