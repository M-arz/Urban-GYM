import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT ?? 3007);
  console.log(`Recommendation Service corriendo en puerto ${process.env.PORT ?? 3007}`);
}
void bootstrap();
