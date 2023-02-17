import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AppModule } from './app.module';

const {
  combine,
  errors,
  json: jsonFormat,
  timestamp,
  ms,
  prettyPrint,
  colorize,
} = winston.format;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      level: 'debug',
      format: combine(
        errors({ stack: true }),
        jsonFormat(),
        timestamp({ format: 'isoDateTime' }),
        ms(),
        prettyPrint(),
        colorize(),
      ),
      transports: [new winston.transports.Console()],
    }),
  });

  const config = new DocumentBuilder()
    .setTitle('canverse-backend')
    .setDescription('canverse-backend API description')
    .setVersion('1.0')
    .addTag('canverse')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // List of options: https://docs.nestjs.com/techniques/validation#using-the-built-in-validationpipe
  const validationPipe = new ValidationPipe({
    enableDebugMessages: true, // TODO: true if debug, false if prod?
    skipUndefinedProperties: false,
    skipNullProperties: false,
    skipMissingProperties: false,
    whitelist: false, // TODO: false if debug, true if prod?
    forbidNonWhitelisted: false, // TODO: false if debug, true if prod?
    forbidUnknownValues: false, // TODO: false if debug, true if prod?
    disableErrorMessages: false,
    dismissDefaultMessages: false,
    transform: true,
    validationError: {
      target: true, // TODO: true if debug, false if prod?
      value: true, // TODO: true if debug, false if prod?
    },
  });

  app.useGlobalPipes(validationPipe);
  app.use(json());

  app.enableCors();
  // ConfigService not initialized at this point. Use process.env.
  await app.listen(process.env.PORT || 3001);
}
bootstrap();
