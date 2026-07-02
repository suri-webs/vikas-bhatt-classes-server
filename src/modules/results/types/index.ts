export interface IResult {
    id: string;
    rollNumber: string;
    subject: string;
    month: string;
    url: string;
    week: string;
    marksScored?: number;
    totalMarks?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
