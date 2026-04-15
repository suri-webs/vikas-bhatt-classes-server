import { model, models, Schema } from "mongoose";


const resultSchema = new Schema({
    rollNumber: {
       type:String,
        required: true
    },
    subject:{
        type:String,
     required:true,
    },
    month: {
        type: String,
        required:true,
    },
    url:{
        type: String,
        unique: true,
        required: true,
    },
    week: {
        type: String,
        required: true,
    }
}, { timestamps: true });

export const ResultModel = models.Result || model("Result", resultSchema);