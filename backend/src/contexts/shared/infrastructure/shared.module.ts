import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RelationshipService, SightingService } from '../application/services';
import { RelationshipRepository, SightingRepository } from '../domain';
import { HealthController } from './controllers/health.controller';
import { HealthService } from './health.service';
import {
    RelationshipMongooseRepository,
    SightingMongooseRepository,
} from './persistence/repositories';
import {
    RelationshipDocument,
    RelationshipSchema,
    SightingDocument,
    SightingSchema,
} from './persistence/schemas';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: RelationshipDocument.name, schema: RelationshipSchema },
            { name: SightingDocument.name, schema: SightingSchema },
        ]),
    ],
    controllers: [HealthController],
    providers: [
        HealthService,
        RelationshipMongooseRepository,
        SightingMongooseRepository,
        RelationshipService,
        SightingService,
        {
            provide: RelationshipRepository,
            useExisting: RelationshipMongooseRepository,
        },
        {
            provide: SightingRepository,
            useExisting: SightingMongooseRepository,
        },
    ],
    exports: [RelationshipService, SightingService],
})
export class SharedModule {}
