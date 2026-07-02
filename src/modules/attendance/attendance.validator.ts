import { CreateAttendanceDtoSchema, CreateAttendanceDto } from "./dto/create-attendance.dto";
import { UpdateAttendanceDtoSchema, UpdateAttendanceDto } from "./dto/update-attendance.dto";

export function validateCreateAttendance(data: any): { success: true; data: CreateAttendanceDto } | { success: false; error: string } {
    const parsed = CreateAttendanceDtoSchema.safeParse(data);
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues.map((err: any) => err.message).join(", ") };
    }
    return { success: true, data: parsed.data };
}

export function validateUpdateAttendance(data: any): { success: true; data: UpdateAttendanceDto } | { success: false; error: string } {
    const parsed = UpdateAttendanceDtoSchema.safeParse(data);
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues.map((err: any) => err.message).join(", ") };
    }
    return { success: true, data: parsed.data };
}
