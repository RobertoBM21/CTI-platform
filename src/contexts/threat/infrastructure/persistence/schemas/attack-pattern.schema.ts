import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { TLP } from '../../../domain/value-objects/tlp.vo';

@Schema({ timestamps: true, collection: 'attack_patterns' })
export class AttackPatternDocument {
    @Prop({ required: true, index: true })
    name!: string;

    @Prop()
    description?: string;

    @Prop({ type: [String] })
    aliases!: string[];

    @Prop({ index: true, sparse: true })
    externalReference?: string;

    @Prop()
    killChainPhase?: string;

    @Prop({ type: String, enum: Object.values(TLP), default: TLP.WHITE })
    tlp!: string;

    @Prop({
        type: [MongooseSchema.Types.ObjectId],
        ref: 'AttackPatternDocument',
    })
    subPatternIds!: MongooseSchema.Types.ObjectId[];
}

export type AttackPatternDoc = HydratedDocument<AttackPatternDocument>;
export const AttackPatternSchema = SchemaFactory.createForClass(
    AttackPatternDocument,
);
