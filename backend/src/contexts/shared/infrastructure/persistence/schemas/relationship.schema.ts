import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { RelationshipType } from '../../../domain/value-objects/relationship-type.vo';
import { TLP } from '../../../domain/value-objects/tlp.vo';

@Schema({ timestamps: true, collection: 'relationships' })
export class RelationshipDocument {
    @Prop({ required: true, unique: true, index: true })
    domainId!: string;

    @Prop({
        required: true,
        type: String,
        enum: Object.values(RelationshipType),
        index: true,
    })
    relationshipType!: string;

    @Prop()
    description?: string;

    @Prop({ required: true, index: true })
    sourceRef!: string;

    @Prop({ required: true, index: true })
    targetRef!: string;

    @Prop()
    startTime?: Date;

    @Prop()
    stopTime?: Date;

    @Prop({ type: String, enum: Object.values(TLP), default: TLP.WHITE })
    tlp!: string;

    createdAt!: Date;
    updatedAt!: Date;
}

export type RelationshipDoc = HydratedDocument<RelationshipDocument>;
export const RelationshipSchema =
    SchemaFactory.createForClass(RelationshipDocument);
