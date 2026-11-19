import { BadRequestException, Body, Controller, Delete, Get, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { ApiKeyGuard } from './api-key.guard';
import { SignageGateway } from './signage.gateway';
import { SignageService } from './signage.service';

const VIDEO = /\.(mp4|webm)$/i;

@Controller('api')
export class SignageController {
  constructor(private s: SignageService, private g: SignageGateway) {}

  @Get('channel')
  channel() {
    return this.s.channel;
  }

  @Get('queue')
  queue() {
    return this.s.queue;
  }

  @Get('auth')
  @UseGuards(ApiKeyGuard)
  auth() {
    return { ok: true };
  }

  /** Publish dari CMS: simpan hasil edit, lalu minta semua player memperbarui tampilan. */
  @Put('channel')
  @UseGuards(ApiKeyGuard)
  save(@Body() b: any) {
    const bad =
      !Array.isArray(b?.blocks) ||
      b.blocks.some(
        (x: any) =>
          !x.id ||
          !Array.isArray(x.items) ||
          ['x', 'y', 'w', 'h'].some((k) => !Number.isFinite(x[k])) ||
          x.w <= 0 ||
          x.h <= 0 ||
          x.items.some((i: any) => ['image', 'video', 'bgimage'].includes(i.type) && !String(i.src).startsWith('/media/')),
      );
    if (bad) throw new BadRequestException('Data channel tidak valid');
    this.s.save(b);
    this.g.emit('publish', { version: this.s.channel.version });
    return { version: this.s.channel.version };
  }

  @Post('media')
  @UseGuards(ApiKeyGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'data', 'media'),
        filename: (_r, f, cb) => cb(null, `${Date.now()}-${f.originalname.replace(/[^\w.-]/g, '_')}`),
      }),
      limits: { fileSize: 300 * 1024 * 1024 },
      fileFilter: (_r, f, cb) => cb(null, /\.(jpe?g|png|gif|webp|mp4|webm)$/i.test(f.originalname)),
    }),
  )
  upload(@UploadedFile() f: any) {
    if (!f) throw new BadRequestException('File ditolak. Gunakan jpg, png, gif, webp, mp4, atau webm.');
    return { src: '/media/' + encodeURIComponent(f.filename), type: VIDEO.test(f.filename) ? 'video' : 'image' };
  }

  @Post('queue/call')
  @UseGuards(ApiKeyGuard)
  call(@Body() b: any) {
    if (!(Number(b.service) > 0) || b.number == null || b.number === '') {
      throw new BadRequestException('Isi service (angka) dan number');
    }
    const entry = this.s.call(Number(b.service), String(b.prefix ?? ''), String(b.number));
    this.g.emit('queue', { service: Number(b.service), ...entry });
    return entry;
  }

  @Post('queue/clear')
  @UseGuards(ApiKeyGuard)
  clearQueue(@Body() b: any) {
    const service = b?.service ? Number(b.service) : undefined;
    const q = this.s.clear(service);
    this.g.emit('queue:clear', { service });
    this.g.emit('queue:all', q);
    return { ok: true, queue: q };
  }

  @Delete('queue')
  @UseGuards(ApiKeyGuard)
  deleteQueue(@Body() b: any) {
    return this.clearQueue(b);
  }
}
