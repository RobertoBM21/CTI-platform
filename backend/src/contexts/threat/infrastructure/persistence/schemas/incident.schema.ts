import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TLP } from '../../../domain/value-objects/tlp.vo';

@Schema({ timestamps: true, collection: 'incidents' })
export class IncidentDocument {
    @Prop({ required: true, unique: true, index: true })
    domainId!: string;

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

    @Prop({ type: [String] })
    threatActorIds!: string[];

    @Prop()
    campaignId?: string;

    @Prop({ type: [String] })
    attackPatternIds!: string[];

    createdAt!: Date;
    updatedAt!: Date;
}

export type IncidentDoc = HydratedDocument<IncidentDocument>;
export const IncidentSchema = SchemaFactory.createForClass(IncidentDocument);
