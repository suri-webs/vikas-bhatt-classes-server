import { Injectable } from '@nestjs/common';
import { ResultRepository } from "./result.repository";
import { UserModel } from "@/src/models/User";
import { CreateResultDto } from "./dto/create-result.dto";
import { UpdateResultDto } from "./dto/update-result.dto";

@Injectable()
export class ResultService {
    constructor(private readonly resultRepository: ResultRepository) {}

    async getResults(rollNumber?: string | null) {
        if (rollNumber) {
            return this.resultRepository.findByRollNumber(rollNumber);
        }
        return this.resultRepository.findAll();
    }

    async getResultByUrlAndRollNumber(url: string, rollNumber: string) {
        const result = await this.resultRepository.findOneByUrlAndRollNumber(url, rollNumber);
        if (!result) {
            throw new Error("Result not found");
        }
        return result;
    }

    async getResultById(id: string) {
        const result = await this.resultRepository.findById(id);
        if (!result) {
            throw new Error("Result not found");
        }
        return result;
    }

    async createResult(dto: CreateResultDto) {
        const user = await UserModel.findOne({ rollNumber: dto.rollNumber });
        if (!user) {
            throw new Error("No user found with given roll number");
        }

        const result = await this.resultRepository.create(dto);

        user.results.push(result._id);
        await user.save();

        return result;
    }

    async updateResult(id: string, dto: UpdateResultDto) {
        const updated = await this.resultRepository.update(id, dto);
        if (!updated) {
            throw new Error("Result not found");
        }
        return updated;
    }

    async deleteResult(id: string) {
        const deletedResult = await this.resultRepository.delete(id);
        if (!deletedResult) {
            throw new Error("Result not found");
        }

        await UserModel.findOneAndUpdate(
            { rollNumber: deletedResult.rollNumber },
            { $pull: { results: deletedResult._id } }
        );

        return deletedResult;
    }
}
