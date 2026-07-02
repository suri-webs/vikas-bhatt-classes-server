import { Module } from '@nestjs/common';
import { ResultController } from './result.controller';
import { ResultService } from './result.service';
import { ResultRepository } from './result.repository';

@Module({
  controllers: [ResultController],
  providers: [ResultService, ResultRepository],
  exports: [ResultService],
})
export class ResultsModule {}
