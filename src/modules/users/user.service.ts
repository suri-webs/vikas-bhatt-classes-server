import { Injectable } from '@nestjs/common';
import { UserRepository } from "./user.repository";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { hashPassword } from "@/src/lib/bcrypt";
import { UserRole } from "@/src/lib/enums";

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) {}

    async getUsers(rollNumber?: string | null) {
        if (!rollNumber) {
            return this.userRepository.findAll();
        } else {
            const user = await this.userRepository.findByRollNumberPopulated(rollNumber);
            if (!user) {
                throw new Error("No user found with this RollNumber");
            }
            return user;
        }
    }

    async getUserByIdOrRollNumber(idOrRoll: string) {
        let user = null;
        if (idOrRoll.match(/^[0-9a-fA-F]{24}$/)) {
            user = await this.userRepository.findByIdPopulated(idOrRoll);
        }
        if (!user) {
            user = await this.userRepository.findByRollNumberPopulated(idOrRoll);
        }
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }

    async createUser(dto: CreateUserDto) {
        const hashedPassword = await hashPassword(dto.password);
        return this.userRepository.create({
            ...dto,
            password: hashedPassword,
        });
    }

    async updateUser(requester: { id: string; role: UserRole }, dto: UpdateUserDto) {
        const { id, rollNumber } = dto;

        if (!id && !rollNumber) {
            throw new Error("User Id or Roll Number is required");
        }

        const current = id
            ? await this.userRepository.findById(id)
            : await this.userRepository.findByRollNumber(rollNumber!);

        if (!current) {
            throw new Error("User not found");
        }

        const isAdmin = requester.role === UserRole.ADMIN;
        const isSelf = requester.id === current._id.toString();

        if (!isAdmin && !isSelf) {
            throw new Error("Forbidden: You can only edit your own profile");
        }

        const updateData: Record<string, any> = {};

        if (dto.rollNumber !== undefined) {
            const isSameRollNumber = String(dto.rollNumber) === String(current.rollNumber);
            if (!isAdmin && !isSameRollNumber) {
                throw new Error("Forbidden: Only admins can change roll number");
            }
            updateData.rollNumber = dto.rollNumber;
        }

        if (dto.username !== undefined) updateData.username = dto.username;
        if (dto.classIn !== undefined) updateData.classIn = dto.classIn;
        if (dto.batch !== undefined) updateData.batch = dto.batch;
        if (dto.gmail !== undefined) updateData.gmail = dto.gmail;
        if (dto.phone !== undefined) updateData.phone = dto.phone;
        if (dto.dob !== undefined) updateData.dob = dto.dob;
        if (dto.bio !== undefined) updateData.bio = dto.bio;
        if (dto.avatar !== undefined) updateData.avatar = dto.avatar;

        if (
            dto.country !== undefined || dto.state !== undefined ||
            dto.city !== undefined || dto.pincode !== undefined || dto.address !== undefined
        ) {
            const existing = current.location ?? {};
            updateData.location = {
                country: dto.country ?? existing.country ?? "",
                state: dto.state ?? existing.state ?? "",
                city: dto.city ?? existing.city ?? "",
                pincode: dto.pincode ?? existing.pincode ?? "",
                address: dto.address ?? existing.address ?? "",
            };
        }

        const updated = await this.userRepository.update(current._id.toString(), updateData);
        if (!updated) {
            throw new Error("Failed to update user");
        }
        return updated;
    }

    async deleteUser(requester: { id: string; role: UserRole }, rollNumberOrId: string) {
        if (requester.role !== UserRole.ADMIN) {
            throw new Error("Unauthorized user");
        }

        let deletedUser = null;
        if (rollNumberOrId.match(/^[0-9a-fA-F]{24}$/)) {
            deletedUser = await this.userRepository.deleteById(rollNumberOrId);
        } else {
            deletedUser = await this.userRepository.deleteByRollNumber(rollNumberOrId);
        }

        if (!deletedUser) {
            throw new Error("User not found");
        }

        return deletedUser;
    }
}
