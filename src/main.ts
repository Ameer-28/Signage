import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { cpSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { AppModule } from './app.module';

function initStorage() {
  const dataDir = join(process.cwd(), 'data');
  const mediaDir = join(dataDir, 'media');
  const defaultsDir = join(process.cwd(), 'defaults');

  mkdirSync(mediaDir, { recursive: true });

  if (existsSync(defaultsDir)) {
    const defaultXml = join(defaultsDir, 'PRAMITHA.XML');
    const targetXml = join(dataDir, 'PRAMITHA.XML');
    if (existsSync(defaultXml) && !existsSync(targetXml)) {
      try {
        cpSync(defaultXml, targetXml);
      } catch (e) {
        console.error('Gagal menyalin PRAMITHA.XML default:', e);
      }
    }

    const defaultChannel = join(defaultsDir, 'channel.json');
    const targetChannel = join(dataDir, 'channel.json');
    if (existsSync(defaultChannel) && !existsSync(targetChannel)) {
      try {
        cpSync(defaultChannel, targetChannel);
      } catch (e) {
        console.error('Gagal menyalin channel.json default:', e);
      }
    }

    const defaultMedia = join(defaultsDir, 'media');
    if (existsSync(defaultMedia)) {
      try {
        if (readdirSync(mediaDir).length === 0) {
          cpSync(defaultMedia, mediaDir, { recursive: true });
        }
      } catch (e) {
        console.error('Gagal menyalin media default:', e);
      }
    }
  }
}

async function bootstrap() {
  initStorage();
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
