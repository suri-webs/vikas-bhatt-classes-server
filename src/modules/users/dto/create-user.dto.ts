import { z } from "zod";
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from "../../../lib/enums";

export const CreateUserDtoSchema = z.object({
    username: z.string().min(2),
    gmail: z.string().email(),
    password: z.string().min(6),
    role: z.nativeEnum(UserRole).default(UserRole.STUDENT),
});

export class CreateUserDto {
    @ApiProperty()
    username!: string;

    @ApiProperty()
    gmail!: string;

    @ApiProperty()
    password!: string;

    @ApiProperty({ enum: UserRole, default: UserRole.STUDENT })
    role!: UserRole;
}
