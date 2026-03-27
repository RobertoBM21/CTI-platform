import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AttackMotivation } from '../../../../shared/domain/value-objects/attack-motivation.vo';
import { ResourceLevel } from '../../../../shared/domain/value-objects/resource-level.vo';
import { TLP } from '../../../../shared/domain/value-objects/tlp.vo';
import { ThreatActorRole } from '../../../domain/value-objects/threat-actor-role.vo';
import { ThreatActorSophistication } from '../../../domain/value-objects/threat-actor-sophistication.vo';
import { ThreatActorType } from '../../../domain/value-objects/threat-actor-type.vo';

@Schema({ timestamps: true, collection: 'threat_actors' })
export class ThreatActorDocument {
    @Prop({ required: true, unique: true, index: true })
    domainId!: string;

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

    @Prop({ type: [String] })
    attackPatternIds!: string[];

    createdAt!: Date;
    updatedAt!: Date;
}

export type ThreatActorDoc = HydratedDocument<ThreatActorDocument>;
export const ThreatActorSchema =
    SchemaFactory.createForClass(ThreatActorDocument);
