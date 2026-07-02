import { z } from "zod";
import { ApiProperty } from '@nestjs/swagger';
import { AttendanceStatus } from "../../../lib/enums";

export const CreateAttendanceDtoSchema = z.object({
    rollNumber: z.string().min(1, "Roll number is required"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    status: z.nativeEnum(AttendanceStatus),
    remarks: z.string().optional(),
});

export class CreateAttendanceDto {
    @ApiProperty()
    rollNumber!: string;

    @ApiProperty()
    date!: string;

    @ApiProperty({ enum: AttendanceStatus })
    status!: AttendanceStatus;

    @ApiProperty({ required: false })
    remarks?: string;
}
