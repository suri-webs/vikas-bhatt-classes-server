import { Injectable } from '@nestjs/common';
import { AttendanceEntity } from "./entities/attendance.entity";

@Injectable()
export class AttendanceRepository {
    async findAll() {
        return AttendanceEntity.find();
    }

    async findById(id: string) {
        return AttendanceEntity.findById(id);
    }

    async findByRollNumber(rollNumber: string) {
        return AttendanceEntity.find({ rollNumber }).sort({ date: -1 });
    }

    async findByDateRange(rollNumber: string, startDate: string, endDate: string) {
        return AttendanceEntity.find({
            rollNumber,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1 });
    }

    async findOne(query: Record<string, any>) {
        return AttendanceEntity.findOne(query);
    }

    async create(data: Record<string, any>) {
        return AttendanceEntity.create(data);
    }

    async update(id: string, data: Record<string, any>) {
        return AttendanceEntity.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string) {
        return AttendanceEntity.findByIdAndDelete(id);
    }
}
