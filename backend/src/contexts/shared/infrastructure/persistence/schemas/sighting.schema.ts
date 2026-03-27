import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TLP } from '../../../domain/value-objects/tlp.vo';

@Schema({ timestamps: true, collection: 'sightings' })
export class SightingDocument {
    @Prop({ required: true, unique: true, index: true })
    domainId!: string;

    @Prop()
    description?: string;

    @Prop()
    firstSeen?: Date;

    @Prop()
    lastSeen?: Date;

    @Prop({ default: 1 })
    count!: number;

    @Prop({ required: true, index: true })
    sightingOfRef!: string;

    @Prop({ type: [String] })
    observedDataRefs!: string[];

    @Prop({ type: [String] })
    whereSightedRefs!: string[];

    @Prop({ type: String, enum: Object.values(TLP), default: TLP.WHITE })
    tlp!: string;

    createdAt!: Date;
    updatedAt!: Date;
}

export type SightingDoc = HydratedDocument<SightingDocument>;
export const SightingSchema = SchemaFactory.createForClass(SightingDocument);
