import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TLP } from '../../../../shared/domain/value-objects/tlp.vo';
import { ToolType } from '../../../domain/value-objects/tool-type.vo';

@Schema({ timestamps: true, collection: 'tools' })
export class ToolDocument {
    @Prop({ required: true, unique: true, index: true })
    domainId!: string;

    @Prop({ required: true, index: true })
    name!: string;

    @Prop()
    description?: string;

    @Prop({ type: [String], enum: Object.values(ToolType) })
    toolTypes!: string[];

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

    @Prop()
    toolVersion?: string;

    @Prop({ type: [String] })
    aliases!: string[];

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

export type ToolDoc = HydratedDocument<ToolDocument>;
export const ToolSchema = SchemaFactory.createForClass(ToolDocument);
