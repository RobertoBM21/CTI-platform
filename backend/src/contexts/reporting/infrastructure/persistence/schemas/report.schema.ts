import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TLP } from '../../../../shared/domain/value-objects/tlp.vo';
import { ReportType } from '../../../domain/value-objects/report-type.vo';

@Schema({ timestamps: true, collection: 'reports' })
export class ReportDocument {
    @Prop({ required: true, unique: true, index: true })
    domainId!: string;

    @Prop({ required: true, index: true })
    name!: string;

    @Prop()
    description?: string;

    @Prop({
        type: [String],
        enum: Object.values(ReportType),
        default: [],
    })
    reportTypes!: string[];

    @Prop({ required: true })
    published!: Date;

    @Prop({ type: [String], default: [] })
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

export type ReportDoc = HydratedDocument<ReportDocument>;
export const ReportSchema = SchemaFactory.createForClass(ReportDocument);
