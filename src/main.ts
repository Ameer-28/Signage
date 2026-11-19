import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  mkdirSync(join(process.cwd(), 'data', 'media'), { recursive: true });
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useStaticAssets(join(process.cwd(), 'public'));
  app.useStaticAssets(join(process.cwd(), 'data', 'media'), { prefix: '/media' });
  if (!process.env.API_KEY) console.warn('API_KEY belum diatur, memakai "dev-key". Ganti sebelum dipasang di internet.');
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`Player: http://localhost:${port}/player.html  |  Pemanggil: http://localhost:${port}/caller.html`);
}
bootstrap();
