import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AttackMotivation } from '../../../../shared/domain/value-objects/attack-motivation.vo';
import { ResourceLevel } from '../../../../shared/domain/value-objects/resource-level.vo';
import { TLP } from '../../../../shared/domain/value-objects/tlp.vo';

@Schema({ timestamps: true, collection: 'intrusion_sets' })
export class IntrusionSetDocument {
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
    goals?: string;

    @Prop({ type: String, enum: Object.values(ResourceLevel) })
    resourceLevel?: string;

    @Prop({ type: [String], enum: Object.values(AttackMotivation) })
    primaryMotivations!: string[];

    @Prop({ type: [String], enum: Object.values(AttackMotivation) })
    secondaryMotivations!: string[];

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

export type IntrusionSetDoc = HydratedDocument<IntrusionSetDocument>;
export const IntrusionSetSchema =
    SchemaFactory.createForClass(IntrusionSetDocument);
