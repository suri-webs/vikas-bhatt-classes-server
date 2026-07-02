import { z } from "zod";
import { ApiProperty } from '@nestjs/swagger';

export const UpdateResultDtoSchema = z.object({
    id: z.string().optional(),
    url: z.string().url("Invalid PDF URL format").optional(),
    subject: z.string().optional(),
    month: z.string().optional(),
    week: z.string().optional(),
    marksScored: z.number().optional(),
    totalMarks: z.number().optional(),
});

export class UpdateResultDto {
    @ApiProperty({ required: false })
    id?: string;

    @ApiProperty({ required: false })
    url?: string;

    @ApiProperty({ required: false })
    subject?: string;

    @ApiProperty({ required: false })
    month?: string;

    @ApiProperty({ required: false })
    week?: string;

    @ApiProperty({ required: false })
    marksScored?: number;

    @ApiProperty({ required: false })
    totalMarks?: number;
}
