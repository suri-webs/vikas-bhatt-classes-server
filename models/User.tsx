import { model, models, Schema } from "mongoose";

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
        default: "student",
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
        type: Schema.ObjectId,
        ref: "Result",
    }],
    avatar: {
        type: String,
        default: "",
    },
}, { timestamps: true });

export const UserModel = models.User || model("User", userSchema);