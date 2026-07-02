import { z } from "zod";
import { ApiProperty } from '@nestjs/swagger';
import { AttendanceStatus } from "../../../lib/enums";

export const UpdateAttendanceDtoSchema = z.object({
    status: z.nativeEnum(AttendanceStatus).optional(),
    remarks: z.string().optional(),
});

export class UpdateAttendanceDto {
    @ApiProperty({ enum: AttendanceStatus, required: false })
    status?: AttendanceStatus;

    @ApiProperty({ required: false })
    remarks?: string;
}
