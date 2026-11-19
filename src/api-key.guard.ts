import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

/** Dijalankan sebelum upload/simpan, jadi permintaan tanpa kunci ditolak sebelum file apa pun ditulis. */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const key = ctx.switchToHttp().getRequest().headers['x-api-key'];
    if (key !== (process.env.API_KEY ?? 'dev-key')) throw new UnauthorizedException('Kunci akses salah');
    return true;
  }
}
