import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // CORS
    const configService = app.get(ConfigService);
    const corsOrigin = configService.getOrThrow<string>('app.corsOrigin');
    app.enableCors({ origin: corsOrigin });

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
            forbidUnknownValues: true,
        }),
    );

    // Swagger / OpenAPI setup
    const swaggerConfig = new DocumentBuilder()
        .setTitle('CTI Platform API')
        .setDescription('Cyber Threat Intelligence Platform - MVP')
        .setVersion('0.1.0')
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);

    const port = configService.getOrThrow<number>('app.port');

    await app.listen(port);
}

void bootstrap();
