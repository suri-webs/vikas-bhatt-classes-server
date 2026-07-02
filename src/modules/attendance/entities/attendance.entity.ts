import { model, models, Schema } from "mongoose";
import { AttendanceStatus } from "../../../lib/enums";

const attendanceSchema = new Schema({
    rollNumber: {
        type: String,
        required: true,
    },
    date: {
        type: String, // format YYYY-MM-DD
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(AttendanceStatus),
        required: true,
        default: AttendanceStatus.PRESENT,
    },
    remarks: {
        type: String,
        default: "",
    },
}, { timestamps: true });

// Ensure unique attendance per user per date
attendanceSchema.index({ rollNumber: 1, date: 1 }, { unique: true });

export const AttendanceEntity = models.Attendance || model("Attendance", attendanceSchema);
