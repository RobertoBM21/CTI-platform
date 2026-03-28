import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TLP } from '../../../../shared/domain/value-objects/tlp.vo';
import { OpinionValue } from '../../../domain/value-objects/opinion-value.vo';

@Schema({ timestamps: true, collection: 'opinions' })
export class OpinionDocument {
    @Prop({ required: true, unique: true, index: true })
    domainId!: string;

    @Prop({
        required: true,
        type: String,
        enum: Object.values(OpinionValue),
    })
    opinion!: string;

    @Prop({ type: [String] })
    objectRefs!: string[];

    @Prop()
    explanation?: string;

    @Prop({ type: [String] })
    authors!: string[];

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

export type OpinionDoc = HydratedDocument<OpinionDocument>;
export const OpinionSchema = SchemaFactory.createForClass(OpinionDocument);
