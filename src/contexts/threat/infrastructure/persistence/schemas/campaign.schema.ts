import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AttackMotivation } from '../../../domain/value-objects/attack-motivation.vo';
import { TLP } from '../../../domain/value-objects/tlp.vo';

@Schema({ timestamps: true, collection: 'campaigns' })
export class CampaignDocument {
    @Prop({ required: true, unique: true, index: true })
    domainId!: string;

    @Prop({ required: true, index: true })
    name!: string;

    @Prop()
    description?: string;

    @Prop({ type: [String] })
    aliases!: string[];

    @Prop()
    firstSeen?: Date;

    @Prop()
    lastSeen?: Date;

    @Prop()
    objective?: string;

    @Prop({ type: [String], enum: Object.values(AttackMotivation) })
    primaryMotivations!: string[];

    @Prop({ type: [String], enum: Object.values(AttackMotivation) })
    secondaryMotivations!: string[];

    @Prop({ type: String, enum: Object.values(TLP), default: TLP.WHITE })
    tlp!: string;

    @Prop({ type: [String] })
    threatActorIds!: string[];

    @Prop({ type: [String] })
    attackPatternIds!: string[];

    createdAt!: Date;
    updatedAt!: Date;
}

export type CampaignDoc = HydratedDocument<CampaignDocument>;
export const CampaignSchema = SchemaFactory.createForClass(CampaignDocument);
