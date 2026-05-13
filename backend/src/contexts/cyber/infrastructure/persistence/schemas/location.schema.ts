import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TLP } from '../../../../shared/domain/value-objects/tlp.vo';
import { Region } from '../../../domain/value-objects/region.vo';

@Schema({ timestamps: true, collection: 'locations' })
export class LocationDocument {
    @Prop({ required: true, unique: true, index: true })
    domainId!: string;

    @Prop({ required: true, index: true })
    name!: string;

    @Prop()
    description?: string;

    @Prop({ type: Number })
    latitude?: number;

    @Prop({ type: Number })
    longitude?: number;

    @Prop({ type: Number })
    precision?: number;

    @Prop()
    country?: string;

    @Prop({ type: String, enum: Object.values(Region) })
    region?: string;

    @Prop()
    administrativeArea?: string;

    @Prop()
    city?: string;

    @Prop()
    streetAddress?: string;

    @Prop()
    postalCode?: string;

    @Prop({ type: Number, min: 0, max: 100 })
    confidence?: number;

    @Prop({ type: Boolean, default: false })
    revoked!: boolean;

    @Prop({
        type: [
            {
                sourceName: { type: String, required: true },
                description: String,
                externalId: String,
                url: String,
            },
        ],
        default: [],
        _id: false,
    })
    externalReferences!: {
        sourceName: string;
        description?: string;
        externalId?: string;
        url?: string;
    }[];

    @Prop({ type: String, enum: Object.values(TLP), default: TLP.WHITE })
    tlp!: string;

    createdAt!: Date;
    updatedAt!: Date;
}

export type LocationDoc = HydratedDocument<LocationDocument>;
export const LocationSchema = SchemaFactory.createForClass(LocationDocument);
