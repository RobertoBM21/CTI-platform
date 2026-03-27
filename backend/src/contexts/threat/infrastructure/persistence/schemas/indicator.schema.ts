import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TLP } from '../../../../shared/domain/value-objects/tlp.vo';
import { IndicatorType } from '../../../domain/value-objects/indicator-type.vo';
import { IocType } from '../../../domain/value-objects/ioc-type.vo';
import { PatternType } from '../../../domain/value-objects/pattern-type.vo';

@Schema({ timestamps: true, collection: 'indicators' })
export class IndicatorDocument {
    @Prop({ required: true, unique: true, index: true })
    domainId!: string;

    @Prop({ index: true })
    name?: string;

    @Prop({
        required: true,
        type: String,
        enum: Object.values(IocType),
        index: true,
    })
    type!: string;

    @Prop({ required: true, index: true })
    value!: string;

    @Prop()
    description?: string;

    @Prop({ type: [String], enum: Object.values(IndicatorType) })
    indicatorTypes!: string[];

    @Prop()
    pattern?: string;

    @Prop({ type: String, enum: Object.values(PatternType) })
    patternType?: string;

    @Prop()
    patternVersion?: string;

    @Prop()
    validFrom?: Date;

    @Prop()
    validUntil?: Date;

    @Prop({
        type: [
            {
                killChainName: { type: String, required: true },
                phaseName: { type: String, required: true },
            },
        ],
        default: [],
        _id: false,
    })
    killChainPhases!: { killChainName: string; phaseName: string }[];

    @Prop({ type: [String] })
    tags!: string[];

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

export type IndicatorDoc = HydratedDocument<IndicatorDocument>;
export const IndicatorSchema = SchemaFactory.createForClass(IndicatorDocument);
