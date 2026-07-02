import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '@/src/lib/middleware/auth';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { UserModel } from '@/src/models/User';
import { UserRole } from '@/src/lib/enums';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT_AUTH')
    @ApiQuery({ name: 'rollNumber', required: false })
    @ApiQuery({ name: 'startDate', required: false })
    @ApiQuery({ name: 'endDate', required: false })
    @ApiResponse({ status: 200, description: 'List of attendance records.' })
    async getAttendance(
        @Req() req: Request,
        @Query('rollNumber') rollNumber?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const decoded = (req as any).user;

        if (decoded.role === UserRole.ADMIN) {
            const attendance = await this.attendanceService.getAttendance(rollNumber, startDate, endDate);
            return { success: true, attendance };
        }

        if (decoded.role === UserRole.STUDENT) {
            if (!rollNumber) {
                throw new HttpException('rollNumber is required', HttpStatus.BAD_REQUEST);
            }

            const user = await UserModel.findOne({ rollNumber });
            if (!user) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }

            if (decoded.id !== user.id) {
                throw new HttpException('Unauthorized user access', HttpStatus.FORBIDDEN);
            }

            const attendance = await this.attendanceService.getAttendance(rollNumber, startDate, endDate);
            return { success: true, attendance };
        }

        throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT_AUTH')
    @ApiResponse({ status: 200, description: 'Attendance record details.' })
    async getAttendanceById(@Req() req: Request, @Param('id') id: string) {
        const decoded = (req as any).user;
        const record = await this.attendanceService.getAttendanceById(id);

        if (decoded.role === UserRole.STUDENT) {
            const user = await UserModel.findById(decoded.id);
            if (!user || user.rollNumber !== record.rollNumber) {
                throw new HttpException('Forbidden: You can only view your own attendance', HttpStatus.FORBIDDEN);
            }
        }

        return { success: true, attendance: record };
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT_AUTH')
    @ApiBody({ type: CreateAttendanceDto })
    @ApiResponse({ status: 201, description: 'Attendance marked successfully.' })
    async createAttendance(@Req() req: Request, @Body() body: CreateAttendanceDto) {
        const decoded = (req as any).user;
        if (decoded.role !== UserRole.ADMIN) {
            throw new HttpException('Forbidden: Admins only', HttpStatus.FORBIDDEN);
        }

        try {
            const attendance = await this.attendanceService.createAttendance(body);
            return { success: true, attendance };
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to mark attendance', HttpStatus.BAD_REQUEST);
        }
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT_AUTH')
    @ApiBody({ type: UpdateAttendanceDto })
    @ApiResponse({ status: 200, description: 'Attendance updated successfully.' })
    async updateAttendanceById(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() body: UpdateAttendanceDto,
    ) {
        const decoded = (req as any).user;
        if (decoded.role !== UserRole.ADMIN) {
            throw new HttpException('Forbidden: Admins only', HttpStatus.FORBIDDEN);
        }

        try {
            const updated = await this.attendanceService.updateAttendance(id, body);
            return { success: true, attendance: updated };
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to update attendance', HttpStatus.BAD_REQUEST);
        }
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT_AUTH')
    @ApiResponse({ status: 200, description: 'Attendance deleted successfully.' })
    async deleteAttendanceById(@Req() req: Request, @Param('id') id: string) {
        const decoded = (req as any).user;
        if (decoded.role !== UserRole.ADMIN) {
            throw new HttpException('Forbidden: Admins only', HttpStatus.FORBIDDEN);
        }

        try {
            await this.attendanceService.deleteAttendance(id);
            return { success: true, message: 'Attendance record deleted' };
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to delete attendance', HttpStatus.BAD_REQUEST);
        }
    }
}
