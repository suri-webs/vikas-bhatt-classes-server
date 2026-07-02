import { CreateResultDtoSchema, CreateResultDto } from "./dto/create-result.dto";
import { UpdateResultDtoSchema, UpdateResultDto } from "./dto/update-result.dto";

export function validateCreateResult(data: any): { success: true; data: CreateResultDto } | { success: false; error: string } {
    const parsed = CreateResultDtoSchema.safeParse(data);
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues.map((err: any) => err.message).join(", ") };
    }
    return { success: true, data: parsed.data };
}

export function validateUpdateResult(data: any): { success: true; data: UpdateResultDto } | { success: false; error: string } {
    const parsed = UpdateResultDtoSchema.safeParse(data);
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues.map((err: any) => err.message).join(", ") };
    }
    return { success: true, data: parsed.data };
}
