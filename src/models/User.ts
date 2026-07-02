import { model, models, Schema } from "mongoose";
import { UserRole } from "../lib/enums";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    gmail: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    rollNumber: {
        type: String,
        unique: true,
        sparse: true,
    },
    role: {
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.STUDENT,
    },
    phone: {
        type: String,
        default: "",
    },
    dob: {
        type: String,
        default: "",
    },
    location: {
        country: { type: String, default: "" },
        state: { type: String, default: "" },
        city: { type: String, default: "" },
        pincode: { type: String, default: "" },
        address: { type: String, default: "" },
    },
    classIn: {
        type: String,
        default: "",
    },
    batch: {
        type: String,
        default: "",
    },
    bio: {
        type: String,
        default: "",
    },
    results: [{
        type: Schema.Types.ObjectId,
        ref: "Result",
    }],
    attendance: [{
        type: Schema.Types.ObjectId,
        ref: "Attendance",
    }],
    avatar: {
        type: String,
        default: "",
    },
}, { timestamps: true });

export const UserModel = models.User || model("User", userSchema);
