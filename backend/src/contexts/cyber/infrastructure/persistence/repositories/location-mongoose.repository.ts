import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SortCriteria } from '../../../../shared/application/dtos/sort.dto';
import { Location, LocationRepository, Region, TLP } from '../../../domain';
import { LocationDoc, LocationDocument } from '../schemas/location.schema';

@Injectable()
export class LocationMongooseRepository extends LocationRepository {
    constructor(
        @InjectModel(LocationDocument.name)
        private readonly locationModel: Model<LocationDoc>,
    ) {
        super();
    }

    async findById(id: string): Promise<Location | null> {
        const doc = await this.locationModel.findOne({ domainId: id }).exec();
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
            this.locationModel
                .find(query)
                .sort(sortQuery)
                .skip((safePage - 1) * safeLimit)
                .limit(safeLimit)
                .exec(),
            this.locationModel.countDocuments(query).exec(),
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

    async findByName(name: string): Promise<Location | null> {
        const doc = await this.locationModel.findOne({ name }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    async create(entity: Location): Promise<Location> {
        const doc = await this.locationModel.create(this.toPersistence(entity));
        return this.toDomain(doc);
    }

    async update(
        id: string,
        entity: Partial<Location>,
    ): Promise<Location | null> {
        const doc = await this.locationModel
            .findOneAndUpdate(
                { domainId: id },
                this.toPersistencePartial(entity),
                { new: true },
            )
            .exec();
        return doc ? this.toDomain(doc) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.locationModel
            .deleteOne({ domainId: id })
            .exec();
        return result.deletedCount > 0;
    }

    private toDomain(doc: LocationDoc): Location {
        return new Location({
            id: doc.domainId,
            name: doc.name,
            description: doc.description,
            latitude: doc.latitude,
            longitude: doc.longitude,
            country: doc.country,
            region: doc.region as Region | undefined,
            administrativeArea: doc.administrativeArea,
            city: doc.city,
            postalCode: doc.postalCode,
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

    private toPersistence(entity: Location): Record<string, unknown> {
        return {
            domainId: entity.id,
            name: entity.name,
            description: entity.description,
            latitude: entity.latitude,
            longitude: entity.longitude,
            country: entity.country,
            region: entity.region,
            administrativeArea: entity.administrativeArea,
            city: entity.city,
            postalCode: entity.postalCode,
            confidence: entity.confidence,
            revoked: entity.revoked,
            externalReferences: entity.externalReferences,
            tlp: entity.tlp,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }

    private toPersistencePartial(
        entity: Partial<Location>,
    ): Record<string, unknown> {
        const update: Record<string, unknown> = { updatedAt: new Date() };

        if (entity.name !== undefined) update.name = entity.name;
        if (entity.description !== undefined)
            update.description = entity.description;
        if (entity.latitude !== undefined) update.latitude = entity.latitude;
        if (entity.longitude !== undefined) update.longitude = entity.longitude;
        if (entity.country !== undefined) update.country = entity.country;
        if (entity.region !== undefined) update.region = entity.region;
        if (entity.administrativeArea !== undefined)
            update.administrativeArea = entity.administrativeArea;
        if (entity.city !== undefined) update.city = entity.city;
        if (entity.postalCode !== undefined)
            update.postalCode = entity.postalCode;
        if (entity.confidence !== undefined)
            update.confidence = entity.confidence;
        if (entity.revoked !== undefined) update.revoked = entity.revoked;
        if (entity.externalReferences !== undefined)
            update.externalReferences = entity.externalReferences;
        if (entity.tlp !== undefined) update.tlp = entity.tlp;

        return update;
    }
}
