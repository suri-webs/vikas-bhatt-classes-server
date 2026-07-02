import { Injectable } from '@nestjs/common';
import { AttendanceService } from "./attendance.service";
import { CreateAttendanceDto } from "./dto/create-attendance.dto";
import { UpdateAttendanceDto } from "./dto/update-attendance.dto";

@Injectable()
export class AttendanceResolver {
    constructor(private readonly attendanceService: AttendanceService) {}

    async resolveGetAttendance(rollNumber?: string | null, startDate?: string | null, endDate?: string | null) {
        return this.attendanceService.getAttendance(rollNumber, startDate, endDate);
    }

    async resolveGetAttendanceById(id: string) {
        return this.attendanceService.getAttendanceById(id);
    }

    async resolveCreateAttendance(dto: CreateAttendanceDto) {
        return this.attendanceService.createAttendance(dto);
    }

    async resolveUpdateAttendance(id: string, dto: UpdateAttendanceDto) {
        return this.attendanceService.updateAttendance(id, dto);
    }

    async resolveDeleteAttendance(id: string) {
        return this.attendanceService.deleteAttendance(id);
    }
}
