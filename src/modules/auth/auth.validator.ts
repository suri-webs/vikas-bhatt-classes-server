import { LoginDtoSchema, LoginDto } from "./dto/login.dto";
import { RegisterDtoSchema, RegisterDto } from "./dto/register.dto";

export function validateLogin(data: any): { success: true; data: LoginDto } | { success: false; error: string } {
    const parsed = LoginDtoSchema.safeParse(data);
    if (!parsed.success) {
        const errorMsg = parsed.error.issues.map((err: any) => err.message).join(", ");
        return { success: false, error: errorMsg };
    }
    return { success: true, data: parsed.data };
}

export function validateRegister(data: any): { success: true; data: RegisterDto } | { success: false; error: string } {
    const parsed = RegisterDtoSchema.safeParse(data);
    if (!parsed.success) {
        const errorMsg = parsed.error.issues.map((err: any) => err.message).join(", ");
        return { success: false, error: errorMsg };
    }
    return { success: true, data: parsed.data };
}
