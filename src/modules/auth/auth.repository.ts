import { Injectable } from '@nestjs/common';
import { UserModel } from "@/src/models/User";
import { UserRole } from "@/src/lib/enums";

@Injectable()
export class AuthRepository {
    async findByGmail(gmail: string) {
        return UserModel.findOne({ gmail });
    }

    async createUser(userData: Record<string, any>) {
        const user = new UserModel(userData);
        return user.save();
    }

    async findOrCreateGoogleUser(gmail: string, username: string, avatar?: string) {
        let user = await UserModel.findOne({ gmail });
        if (!user) {
            user = await UserModel.create({
                username,
                gmail,
                password: "google-oauth",
                avatar: avatar || "",
                role: UserRole.STUDENT,
            });
        }
        return user;
    }
}
