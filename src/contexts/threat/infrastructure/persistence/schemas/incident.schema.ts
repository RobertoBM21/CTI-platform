import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { TLP } from '../../../domain/value-objects/tlp.vo';

@Schema({ timestamps: true, collection: 'incidents' })
export class IncidentDocument {
    @Prop({ required: true, index: true })
    name!: string;

    @Prop()
    description?: string;

    @Prop()
    firstSeen?: Date;

    @Prop()
    lastSeen?: Date;

    @Prop()
    objective?: string;

    @Prop({ type: String, enum: Object.values(TLP), default: TLP.WHITE })
    tlp!: string;

    @Prop({
        type: [MongooseSchema.Types.ObjectId],
        ref: 'ThreatActorDocument',
    })
    threatActorIds!: MongooseSchema.Types.ObjectId[];

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'CampaignDocument' })
    campaignId?: MongooseSchema.Types.ObjectId;

    @Prop({
        type: [MongooseSchema.Types.ObjectId],
        ref: 'AttackPatternDocument',
    })
    attackPatternIds!: MongooseSchema.Types.ObjectId[];
}

export type IncidentDoc = HydratedDocument<IncidentDocument>;
export const IncidentSchema = SchemaFactory.createForClass(IncidentDocument);
