import { Module } from '@nestjs/common';
import { SignageController } from './signage.controller';
import { SignageGateway } from './signage.gateway';
import { SignageService } from './signage.service';

@Module({
  controllers: [SignageController],
  providers: [SignageService, SignageGateway],
})
export class AppModule {}
