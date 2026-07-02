import { Module } from '@nestjs/common';
import { EnquiryController } from './enquiry.controller';

@Module({
  controllers: [EnquiryController],
})
export class EnquiryModule {}
