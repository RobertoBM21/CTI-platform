import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRepository } from '../../../domain';
import { UserDocument } from '../schemas/user.schema';

@Injectable()
export class UserMongooseRepository implements UserRepository {
    constructor(
        @InjectModel(UserDocument.name)
        private readonly model: Model<UserDocument>,
    ) {}

    async findById(id: string): Promise<User | null> {
        const doc = await this.model.findOne({ domainId: id }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const doc = await this.model
            .findOne({ email: email.toLowerCase() })
            .exec();
        return doc ? this.toDomain(doc) : null;
    }

    async findByGoogleId(googleId: string): Promise<User | null> {
        const doc = await this.model.findOne({ googleId }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    async save(user: User): Promise<User> {
        const doc = await this.model
            .findOneAndUpdate(
                { domainId: user.id },
                {
                    $set: {
                        email: user.email,
                        passwordHash: user.passwordHash,
                        googleId: user.googleId,
                        name: user.name,
                    },
                    $setOnInsert: {
                        domainId: user.id,
                        createdAt: user.createdAt,
                    },
                },
                { upsert: true, returnDocument: 'after' },
            )
            .exec();
        return this.toDomain(doc);
    }

    private toDomain(doc: UserDocument): User {
        return new User({
            id: doc.domainId,
            email: doc.email,
            passwordHash: doc.passwordHash,
            googleId: doc.googleId,
            name: doc.name,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }
}
