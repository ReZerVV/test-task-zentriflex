import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const PORT = process.env.PORT || 5050;
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
        .setTitle('Test api')
        .setDescription('Api for the test case ')
        .setVersion('1.0')
        .addTag('Auth')
        .addTag('Users')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());
    await app.listen(PORT);
}

bootstrap();
