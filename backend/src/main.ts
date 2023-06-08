import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { AppModule } from './app.module';
import { urlencoded, json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Pong game')
    .setDescription('42 ft_transcendence project')
    .setVersion('0.1')
    .addTag('42')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const corsOptions: CorsOptions = {
    origin: '*', // Replace with your allowed origin(s)
    methods: ['GET', 'POST'], // Specify the allowed HTTP methods
    // allowedHeaders: ['my-custom-header'], // Specify the allowed custom headers
    credentials: true, // Set to true if you want to allow sending cookies
  };
  app.enableCors();
  await app.listen(3001);
}
bootstrap();

// link - https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-e237d3c2348c471c2c1edfa4984704c39780881c625e85291b343185214d438d&redirect_uri=http://localhost:3000/auth/&response_type=code&scope=public&state=random
