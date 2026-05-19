import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'users' })
export class UserDocument {
    @Prop({ required: true, unique: true, index: true })
    domainId!: string;

    @Prop({ required: true, unique: true, lowercase: true, index: true })
    email!: string;

    @Prop()
    passwordHash?: string;

    @Prop({ index: true, sparse: true })
    googleId?: string;

    @Prop()
    name?: string;

    createdAt!: Date;
    updatedAt!: Date;
}

export type UserDoc = HydratedDocument<UserDocument>;
export const UserSchema = SchemaFactory.createForClass(UserDocument);
