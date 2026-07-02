import { z } from "zod";
import { ApiProperty } from '@nestjs/swagger';

export const CreateResultDtoSchema = z.object({
    rollNumber: z.string().min(1, "Roll number is required"),
    url: z.string().url("Invalid PDF URL format"),
    subject: z.string().min(1, "Subject is required"),
    month: z.string().min(1, "Month is required"),
    week: z.string().min(1, "Week is required"),
    marksScored: z.number().default(0),
    totalMarks: z.number().default(100),
});

export class CreateResultDto {
    @ApiProperty()
    rollNumber!: string;

    @ApiProperty()
    url!: string;

    @ApiProperty()
    subject!: string;

    @ApiProperty()
    month!: string;

    @ApiProperty()
    week!: string;

    @ApiProperty({ default: 0 })
    marksScored!: number;

    @ApiProperty({ default: 100 })
    totalMarks!: number;
}
