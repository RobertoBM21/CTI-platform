import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { IocType } from '../../../domain/value-objects/ioc-type.vo';
import { TLP } from '../../../domain/value-objects/tlp.vo';

@Schema({ timestamps: true, collection: 'iocs' })
export class IocDocument {
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

    @Prop({
        required: true,
        type: MongooseSchema.Types.ObjectId,
        index: true,
    })
    sourceId!: MongooseSchema.Types.ObjectId;
}

export type IocDoc = HydratedDocument<IocDocument>;
export const IocSchema = SchemaFactory.createForClass(IocDocument);

IocSchema.index({ sourceType: 1, sourceId: 1 });
