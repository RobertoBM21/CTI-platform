import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TLP } from '../../../../shared/domain/value-objects/tlp.vo';
import { IdentityClass } from '../../../domain/value-objects/identity-class.vo';

@Schema({ timestamps: true, collection: 'identities' })
export class IdentityDocument {
    @Prop({ required: true, unique: true, index: true })
    domainId!: string;

    @Prop({ required: true, index: true })
    name!: string;

    @Prop()
    description?: string;

    @Prop({ type: String, enum: Object.values(IdentityClass) })
    identityClass?: string;

    @Prop({ type: [String] })
    sectors!: string[];

    @Prop()
    contactInformation?: string;

    @Prop({ type: [String] })
    roles!: string[];

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

export type IdentityDoc = HydratedDocument<IdentityDocument>;
export const IdentitySchema = SchemaFactory.createForClass(IdentityDocument);
