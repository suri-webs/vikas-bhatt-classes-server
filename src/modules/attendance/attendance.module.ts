import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceRepository } from './attendance.repository';
import { AttendanceResolver } from './attendance.resolver';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceRepository, AttendanceResolver],
  exports: [AttendanceService],
})
export class AttendanceModule {}
