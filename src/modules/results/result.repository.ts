import { Injectable } from '@nestjs/common';
import { ResultModel } from "@/src/models/Result";

@Injectable()
export class ResultRepository {
    async findAll() {
        return ResultModel.find();
    }

    async findById(id: string) {
        return ResultModel.findById(id);
    }

    async findByRollNumber(rollNumber: string) {
        return ResultModel.find({ rollNumber });
    }

    async findOneByUrlAndRollNumber(url: string, rollNumber: string) {
        return ResultModel.findOne({ url, rollNumber });
    }

    async create(resultData: Record<string, any>) {
        return ResultModel.create(resultData);
    }

    async update(id: string, updateData: Record<string, any>) {
        return ResultModel.findByIdAndUpdate(id, updateData, { new: true });
    }

    async delete(id: string) {
        return ResultModel.findByIdAndDelete(id);
    }
}
