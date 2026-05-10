import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TLP } from '../../../../shared/domain/value-objects/tlp.vo';

@Schema({ timestamps: true, collection: 'observed_data' })
export class ObservedDataDocument {
    @Prop({ required: true, unique: true, index: true })
    domainId!: string;

    @Prop({ required: true })
    firstObserved!: Date;

    @Prop({ required: true })
    lastObserved!: Date;

    @Prop({ required: true, type: Number, min: 1 })
    numberObserved!: number;

    @Prop({ type: [String] })
    objectRefs!: string[];

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

export type ObservedDataDoc = HydratedDocument<ObservedDataDocument>;
export const ObservedDataSchema =
    SchemaFactory.createForClass(ObservedDataDocument);
