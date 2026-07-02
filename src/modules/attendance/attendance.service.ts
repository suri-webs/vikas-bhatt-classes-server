import { Injectable } from '@nestjs/common';
import { AttendanceRepository } from './attendance.repository';
import { UserModel } from '@/src/models/User';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from "./dto/update-attendance.dto";

@Injectable()
export class AttendanceService {
    constructor(private readonly attendanceRepository: AttendanceRepository) {}

    async getAttendance(rollNumber?: string | null, startDate?: string | null, endDate?: string | null) {
        if (rollNumber) {
            if (startDate && endDate) {
                return this.attendanceRepository.findByDateRange(rollNumber, startDate, endDate);
            }
            return this.attendanceRepository.findByRollNumber(rollNumber);
        }
        return this.attendanceRepository.findAll();
    }

    async getAttendanceById(id: string) {
        const attendance = await this.attendanceRepository.findById(id);
        if (!attendance) {
            throw new Error("Attendance record not found");
        }
        return attendance;
    }

    async createAttendance(dto: CreateAttendanceDto) {
        const user = await UserModel.findOne({ rollNumber: dto.rollNumber });
        if (!user) {
            throw new Error("No user found with given roll number");
        }

        const existing = await this.attendanceRepository.findOne({
            rollNumber: dto.rollNumber,
            date: dto.date,
        });
        if (existing) {
            throw new Error("Attendance record already marked for this date");
        }

        const attendance = await this.attendanceRepository.create(dto);

        user.attendance.push(attendance._id);
        await user.save();

        return attendance;
    }

    async updateAttendance(id: string, dto: UpdateAttendanceDto) {
        const updated = await this.attendanceRepository.update(id, dto);
        if (!updated) {
            throw new Error("Attendance record not found");
        }
        return updated;
    }

    async deleteAttendance(id: string) {
        const deleted = await this.attendanceRepository.delete(id);
        if (!deleted) {
            throw new Error("Attendance record not found");
        }

        await UserModel.findOneAndUpdate(
            { rollNumber: deleted.rollNumber },
            { $pull: { attendance: deleted._id } }
        );

        return deleted;
    }
}
