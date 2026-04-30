import { model, models, Schema } from "mongoose";

const resultSchema = new Schema({
    rollNumber: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true,
    },
    month: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        unique: true,
        required: true,
    },
    week: {
        type: String,
        required: true,
    },
    marksScored: {
        type: Number,
        required: false,
        default: 0,
    },
    totalMarks: {
        type: Number,
        required: false,
        default: 100,
    },
}, { timestamps: true });

export const ResultModel = models.Result || model("Result", resultSchema);