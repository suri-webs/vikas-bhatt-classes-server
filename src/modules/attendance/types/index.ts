export interface IAttendance {
    id: string;
    rollNumber: string;
    date: string;
    status: "present" | "absent" | "late" | "leave";
    remarks?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
