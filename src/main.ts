import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  process.setMaxListeners(Infinity);
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('PFA')
    .setDescription('PFA API description')
    .setVersion('1.0')
    .addTag('PFA')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.enableCors({origin:"http://localhost:4200"});
  await app.listen(process.env.APP_PORT);
}

bootstrap();
