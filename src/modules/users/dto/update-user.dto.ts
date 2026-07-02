import { z } from "zod";
import { ApiProperty } from '@nestjs/swagger';

export const UpdateUserDtoSchema = z.object({
    id: z.string().optional(),
    rollNumber: z.string().optional(),
    username: z.string().optional(),
    gmail: z.string().email("Invalid email format").optional(),
    classIn: z.string().optional(),
    batch: z.string().optional(),
    phone: z.string().optional(),
    dob: z.string().optional(),
    bio: z.string().optional(),
    avatar: z.string().optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    pincode: z.string().optional(),
    address: z.string().optional(),
});

export class UpdateUserDto {
    @ApiProperty({ required: false })
    id?: string;

    @ApiProperty({ required: false })
    rollNumber?: string;

    @ApiProperty({ required: false })
    username?: string;

    @ApiProperty({ required: false })
    gmail?: string;

    @ApiProperty({ required: false })
    classIn?: string;

    @ApiProperty({ required: false })
    batch?: string;

    @ApiProperty({ required: false })
    phone?: string;

    @ApiProperty({ required: false })
    dob?: string;

    @ApiProperty({ required: false })
    bio?: string;

    @ApiProperty({ required: false })
    avatar?: string;

    @ApiProperty({ required: false })
    country?: string;

    @ApiProperty({ required: false })
    state?: string;

    @ApiProperty({ required: false })
    city?: string;

    @ApiProperty({ required: false })
    pincode?: string;

    @ApiProperty({ required: false })
    address?: string;
}
