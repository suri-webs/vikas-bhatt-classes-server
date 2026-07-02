import { z } from "zod";
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from "../../../lib/enums";

export const RegisterDtoSchema = z.object({
    username: z.string().min(2, "Username must be at least 2 characters"),
    gmail: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.nativeEnum(UserRole).default(UserRole.STUDENT),
});

export class RegisterDto {
    @ApiProperty()
    username!: string;

    @ApiProperty()
    gmail!: string;

    @ApiProperty()
    password!: string;

    @ApiProperty({ enum: UserRole, default: UserRole.STUDENT })
    role!: UserRole;
}
