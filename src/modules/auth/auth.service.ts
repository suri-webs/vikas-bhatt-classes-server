import { Injectable } from '@nestjs/common';
import { AuthRepository } from "./auth.repository";
import { hashPassword, comparePassword } from "@/src/lib/bcrypt";
import { generateAccessToken, generateRefreshToken } from "@/src/lib/jwt";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { UserRole } from "@/src/lib/enums";

@Injectable()
export class AuthService {
    constructor(private readonly authRepository: AuthRepository) {}

    async login(dto: LoginDto) {
        let user = null;

        if (dto.googleToken) {
            const googleRes = await fetch(
                `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${dto.googleToken}`
            );
            const googleUser = await googleRes.json();

            if (!googleUser.email) {
                throw new Error("Invalid Google token");
            }

            user = await this.authRepository.findOrCreateGoogleUser(
                googleUser.email,
                googleUser.name,
                googleUser.picture
            );
        } else {
            if (!dto.gmail || !dto.password) {
                throw new Error("Email and password required");
            }

            user = await this.authRepository.findByGmail(dto.gmail);
            if (!user) {
                throw new Error("User not found");
            }

            let isMatch = false;
            if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
                isMatch = await comparePassword(dto.password, user.password);
            } else {
                isMatch = dto.password === user.password;
            }

            if (!isMatch) {
                throw new Error("Invalid password");
            }
        }

        const accessToken = generateAccessToken({ id: user._id, role: user.role });
        const refreshToken = generateRefreshToken({ id: user._id, role: user.role });

        return { user, accessToken, refreshToken };
    }

    async register(dto: RegisterDto) {
        const existing = await this.authRepository.findByGmail(dto.gmail);
        if (existing) {
            throw new Error("User already exists");
        }

        const hashedPassword = await hashPassword(dto.password);
        const user = await this.authRepository.createUser({
            username: dto.username,
            gmail: dto.gmail,
            password: hashedPassword,
            role: dto.role || UserRole.STUDENT,
        });

        return user;
    }
}
