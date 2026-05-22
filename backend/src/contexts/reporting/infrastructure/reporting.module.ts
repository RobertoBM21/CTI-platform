import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThreatModule } from '../../threat/infrastructure/threat.module';
import { ReportService } from '../application/services/report.service';
import { ReportRepository } from '../domain/ports/report.repository';
import { ReportsController } from './controllers/reports.controller';
import { ReportMongooseRepository } from './persistence/repositories/report-mongoose.repository';
import {
    ReportDocument,
    ReportSchema,
} from './persistence/schemas/report.schema';

@Module({
    imports: [
        forwardRef(() => ThreatModule),
        MongooseModule.forFeature([
            { name: ReportDocument.name, schema: ReportSchema },
        ]),
    ],
    controllers: [ReportsController],
    providers: [
        ReportMongooseRepository,
        {
            provide: ReportRepository,
            useExisting: ReportMongooseRepository,
        },
        ReportService,
    ],
    exports: [ReportService],
})
export class ReportingModule {}
