import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TLP } from '../../../../shared/domain/value-objects/tlp.vo';
import { IocType } from '../../../domain/value-objects/ioc-type.vo';

@Schema({ timestamps: true, collection: 'iocs' })
export class IocDocument {
    @Prop({ required: true, unique: true, index: true })
    domainId!: string;

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

    @Prop({ type: [String] })
    tags!: string[];

    @Prop({ type: String, enum: Object.values(TLP), default: TLP.WHITE })
    tlp!: string;

    @Prop({
        required: true,
        type: String,
        enum: ['threat-actor', 'campaign', 'incident'],
        index: true,
    })
    sourceType!: string;

    @Prop({ required: true, index: true })
    sourceId!: string;

    createdAt!: Date;
    updatedAt!: Date;
}

export type IocDoc = HydratedDocument<IocDocument>;
export const IocSchema = SchemaFactory.createForClass(IocDocument);

IocSchema.index({ sourceType: 1, sourceId: 1 });
