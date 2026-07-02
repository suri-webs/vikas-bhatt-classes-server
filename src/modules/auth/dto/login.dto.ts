import { z } from "zod";
import { ApiProperty } from '@nestjs/swagger';

export const LoginDtoSchema = z.object({
    gmail: z.string().email("Invalid email format").optional(),
    password: z.string().min(1, "Password is required").optional(),
    googleToken: z.string().optional(),
});

export class LoginDto {
    @ApiProperty({ required: false })
    gmail?: string;

    @ApiProperty({ required: false })
    password?: string;

    @ApiProperty({ required: false })
    googleToken?: string;
}
