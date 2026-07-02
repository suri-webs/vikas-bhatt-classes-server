import { Injectable } from '@nestjs/common';
import { UserModel } from "@/src/models/User";

@Injectable()
export class UserRepository {
    async findAll() {
        return UserModel.find();
    }

    async findById(id: string) {
        return UserModel.findById(id);
    }

    async findByIdPopulated(id: string) {
        return UserModel.findById(id).populate("results");
    }

    async findByRollNumber(rollNumber: string) {
        return UserModel.findOne({ rollNumber });
    }

    async findByRollNumberPopulated(rollNumber: string) {
        return UserModel.findOne({ rollNumber }).populate("results");
    }

    async create(userData: Record<string, any>) {
        const user = new UserModel(userData);
        return user.save();
    }

    async update(id: string, updateData: Record<string, any>) {
        return UserModel.findByIdAndUpdate(id, updateData, { new: true });
    }

    async deleteByRollNumber(rollNumber: string) {
        return UserModel.findOneAndDelete({ rollNumber });
    }

    async deleteById(id: string) {
        return UserModel.findByIdAndDelete(id);
    }
}
