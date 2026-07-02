import { Module } from '@nestjs/common';

import { AttendanceModule } from './modules/attendance/attendance.module';
import { HealthModule } from './modules/health/health.module';
import { EnquiryModule } from './modules/enquiry/enquiry.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ResultsModule } from './modules/results/results.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ResultsModule,
    AttendanceModule,
    HealthModule,
    EnquiryModule,
  ],
})
export class AppModule { }
