import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();

// link - https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-e237d3c2348c471c2c1edfa4984704c39780881c625e85291b343185214d438d&redirect_uri=http://localhost:3000/auth/&response_type=code&scope=public&state=random
