import { CreateUserDtoSchema, CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDtoSchema, UpdateUserDto } from "./dto/update-user.dto";

export function validateCreateUser(data: any): { success: true; data: CreateUserDto } | { success: false; error: string } {
    const parsed = CreateUserDtoSchema.safeParse(data);
    if (!parsed.success) {
        const errorMsg = parsed.error.issues.map((err: any) => `${err.path.join(".")}: ${err.message}`).join(", ");
        return { success: false, error: errorMsg };
    }
    return { success: true, data: parsed.data };
}

export function validateUpdateUser(data: any): { success: true; data: UpdateUserDto } | { success: false; error: string } {
    const parsed = UpdateUserDtoSchema.safeParse(data);
    if (!parsed.success) {
        const errorMsg = parsed.error.issues.map((err: any) => `${err.path.join(".")}: ${err.message}`).join(", ");
        return { success: false, error: errorMsg };
    }
    return { success: true, data: parsed.data };
}
