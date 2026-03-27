import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TLP } from '../../../../shared/domain/value-objects/tlp.vo';

@Schema({ timestamps: true, collection: 'attack_patterns' })
export class AttackPatternDocument {
    @Prop({ required: true, unique: true, index: true })
    domainId!: string;

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

    @Prop({ type: [String] })
    subPatternIds!: string[];

    createdAt!: Date;
    updatedAt!: Date;
}

export type AttackPatternDoc = HydratedDocument<AttackPatternDocument>;
export const AttackPatternSchema = SchemaFactory.createForClass(
    AttackPatternDocument,
);
