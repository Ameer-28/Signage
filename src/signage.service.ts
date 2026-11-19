import { Injectable, OnModuleInit } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const KINDS = ['bgimage', 'image', 'datetime', 'newsticker', 'queueview'];

@Injectable()
export class SignageService implements OnModuleInit {
  channel: any;
  queue: Record<string, { prefix: string; number: string; at: number }> = {};
  private file = join(process.cwd(), 'data', 'channel.json');

  onModuleInit() {
    this.load();
  }

  /** Memakai channel.json (hasil edit CMS) kalau ada. Kalau belum, impor dari XML SevenSign lalu simpan. */
  load() {
    if (existsSync(this.file)) {
      this.channel = JSON.parse(readFileSync(this.file, 'utf8'));
      return;
    }
    const xml = readFileSync(join(process.cwd(), 'data', 'PRAMITHA.XML'), 'utf8').replace(/^\uFEFF/, '');
    const doc: any = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      isArray: (n) => ['block', 'item', ...KINDS].includes(n),
    }).parse(xml);
    const p = doc.channel.program;
    this.channel = {
      version: Date.now(),
      name: doc.channel.name,
      w: +p.w,
      h: +p.h,
      blocks: p.block
        .filter((b: any) => b.id)
        .map((b: any) => {
          const items = KINDS.flatMap((k) => (b[k] ?? []).map((a: any) => this.item(k, a)));
          return { id: b.id, x: +b.x, y: +b.y, w: +b.w, h: +b.h, orig: { x: +b.x, y: +b.y, w: +b.w, h: +b.h }, items, playlist: items.some((i: any) => i.type === 'image') };
        }),
    };
    writeFileSync(this.file, JSON.stringify(this.channel));
  }

  save(ch: any) {
    ch.version = Date.now();
    this.channel = ch;
    writeFileSync(this.file, JSON.stringify(ch));
  }

  private item(type: string, a: any) {
    const { item, ...rest } = a;
    const out: any = { type, ...rest };
    if (a.url) out.src = '/media/' + encodeURIComponent(a.url.split('\\').pop());
    const [h, m, s] = (a.duration ?? '0:0:0').split(':').map(Number);
    out.seconds = h * 3600 + m * 60 + s;
    if (item) out.lines = item.map((i: any) => i.text);
    return out;
  }

  call(service: number, prefix: string, number: string) {
    return (this.queue[service] = { prefix, number, at: Date.now() });
  }
}
