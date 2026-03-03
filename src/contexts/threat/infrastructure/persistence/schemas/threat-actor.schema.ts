import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { AttackMotivation } from '../../../domain/value-objects/attack-motivation.vo';
import { ResourceLevel } from '../../../domain/value-objects/resource-level.vo';
import { ThreatActorRole } from '../../../domain/value-objects/threat-actor-role.vo';
import { ThreatActorSophistication } from '../../../domain/value-objects/threat-actor-sophistication.vo';
import { ThreatActorType } from '../../../domain/value-objects/threat-actor-type.vo';
import { TLP } from '../../../domain/value-objects/tlp.vo';

@Schema({ timestamps: true, collection: 'threat_actors' })
export class ThreatActorDocument {
    @Prop({ required: true, index: true })
    name!: string;

    @Prop()
    description?: string;

    @Prop({ type: [String], enum: Object.values(ThreatActorType) })
    threatActorTypes!: string[];

    @Prop({ type: [String] })
    aliases!: string[];

    @Prop()
    firstSeen?: Date;

    @Prop()
    lastSeen?: Date;

    @Prop({ type: [String], enum: Object.values(ThreatActorRole) })
    roles!: string[];

    @Prop()
    goals?: string;

    @Prop({ type: String, enum: Object.values(ThreatActorSophistication) })
    sophistication?: string;

    @Prop({ type: String, enum: Object.values(ResourceLevel) })
    resourceLevel?: string;

    @Prop({ type: [String], enum: Object.values(AttackMotivation) })
    primaryMotivations!: string[];

    @Prop({ type: [String], enum: Object.values(AttackMotivation) })
    secondaryMotivations!: string[];

    @Prop()
    personalMotivations?: string;

    @Prop({ type: String, enum: Object.values(TLP), default: TLP.WHITE })
    tlp!: string;

    @Prop({
        type: [MongooseSchema.Types.ObjectId],
        ref: 'AttackPatternDocument',
    })
    attackPatternIds!: MongooseSchema.Types.ObjectId[];
}

export type ThreatActorDoc = HydratedDocument<ThreatActorDocument>;
export const ThreatActorSchema =
    SchemaFactory.createForClass(ThreatActorDocument);
