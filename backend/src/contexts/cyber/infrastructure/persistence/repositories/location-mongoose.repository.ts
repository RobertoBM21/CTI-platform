import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseMongooseRepository } from '../../../../shared/infrastructure/persistence/base-mongoose.repository';
import { Location, LocationRepository, Region, TLP } from '../../../domain';
import { LocationDoc, LocationDocument } from '../schemas/location.schema';

@Injectable()
export class LocationMongooseRepository
    extends BaseMongooseRepository<Location, LocationDoc>
    implements LocationRepository
{
    constructor(@InjectModel(LocationDocument.name) model: Model<LocationDoc>) {
        super(model);
    }

    async findByName(name: string): Promise<Location | null> {
        const doc = await this.model.findOne({ name }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    protected toDomain(doc: LocationDoc): Location {
        return new Location({
            id: doc.domainId,
            name: doc.name,
            description: doc.description,
            latitude: doc.latitude,
            longitude: doc.longitude,
            precision: doc.precision,
            country: doc.country,
            region: doc.region as Region | undefined,
            administrativeArea: doc.administrativeArea,
            city: doc.city,
            streetAddress: doc.streetAddress,
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

    protected toPersistence(entity: Location): Record<string, unknown> {
        return {
            domainId: entity.id,
            name: entity.name,
            description: entity.description,
            latitude: entity.latitude,
            longitude: entity.longitude,
            precision: entity.precision,
            country: entity.country,
            region: entity.region,
            administrativeArea: entity.administrativeArea,
            city: entity.city,
            streetAddress: entity.streetAddress,
            postalCode: entity.postalCode,
            confidence: entity.confidence,
            revoked: entity.revoked,
            externalReferences: entity.externalReferences,
            tlp: entity.tlp,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
}
