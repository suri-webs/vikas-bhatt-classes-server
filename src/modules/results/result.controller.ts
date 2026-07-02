import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { ResultService } from "./result.service";
import { validateCreateResult, validateUpdateResult } from "./result.validator";
import { Request } from 'express';
import { JwtAuthGuard } from '@/src/lib/middleware/auth';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { CreateResultDto } from "./dto/create-result.dto";
import { UpdateResultDto } from "./dto/update-result.dto";
import { connectDB } from '@/src/lib/db';
import { UserModel } from '@/src/models/User';
import { UserRole } from '@/src/lib/enums';

@ApiTags('Results')
@Controller('results')
export class ResultController {
    constructor(private readonly resultService: ResultService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT_AUTH')
    @ApiQuery({ name: 'rollNumber', required: false })
    @ApiQuery({ name: 'url', required: false })
    @ApiResponse({ status: 200, description: 'List of results.' })
    async getResults(
        @Req() req: Request,
        @Query('rollNumber') rollNumber?: string,
        @Query('url') url?: string,
    ) {
        const decoded = (req as any).user;
        await connectDB();

        try {
            if (decoded.role === UserRole.ADMIN) {
                const results = await this.resultService.getResults(rollNumber);
                return { success: true, results };
            }

            if (decoded.role === UserRole.STUDENT) {
                if (!rollNumber) {
                    throw new HttpException('rollNumber is required', HttpStatus.BAD_REQUEST);
                }

                const user = await UserModel.findOne({ rollNumber }).populate("results");
                if (!user) {
                    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
                }

                if (decoded.id !== user.id) {
                    throw new HttpException('Unauthorized user access', HttpStatus.FORBIDDEN);
                }

                if (url) {
                    const resultByUrl = await this.resultService.getResultByUrlAndRollNumber(url, rollNumber);
                    return { success: true, result: resultByUrl };
                }

                return { success: true, results: user.results };
            }

            throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
        } catch (error: any) {
            const status = error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;
            throw new HttpException(error.message || 'Failed to fetch results', status);
        }
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT_AUTH')
    @ApiResponse({ status: 200, description: 'Single result details.' })
    async getResultById(@Req() req: Request, @Param('id') id: string) {
        const decoded = (req as any).user;
        await connectDB();

        try {
            const result = await this.resultService.getResultById(id);

            if (decoded.role === UserRole.STUDENT) {
                const user = await UserModel.findById(decoded.id);
                if (!user || user.rollNumber !== result.rollNumber) {
                    throw new HttpException('Forbidden: You can only view your own results', HttpStatus.FORBIDDEN);
                }
            }

            return { success: true, result };
        } catch (error: any) {
            const status = error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;
            throw new HttpException(error.message || 'Failed to fetch result', status);
        }
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT_AUTH')
    @ApiBody({ type: CreateResultDto })
    @ApiResponse({ status: 201, description: 'Result created successfully.' })
    async createResult(@Req() req: Request, @Body() body: any) {
        const decoded = (req as any).user;
        await connectDB();

        if (decoded.role !== UserRole.ADMIN) {
            throw new HttpException('Forbidden: Admins only', HttpStatus.FORBIDDEN);
        }

        const validation = validateCreateResult(body);
        if (!validation.success) {
            throw new HttpException(validation.error, HttpStatus.BAD_REQUEST);
        }

        try {
            const result = await this.resultService.createResult(validation.data);
            return { success: true, result };
        } catch (error: any) {
            if (error.code === 11000) {
                throw new HttpException('Result already exists', HttpStatus.BAD_REQUEST);
            }
            const status = error.message.includes('No user found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;
            throw new HttpException(error.message || 'Failed to create result', status);
        }
    }

    @Put()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT_AUTH')
    @ApiBody({ type: UpdateResultDto })
    @ApiResponse({ status: 200, description: 'Result updated.' })
    async updateResult(@Req() req: Request, @Body() body: any) {
        const decoded = (req as any).user;
        await connectDB();

        if (decoded.role !== UserRole.ADMIN) {
            throw new HttpException('Forbidden: Admins only', HttpStatus.FORBIDDEN);
        }

        const { id, ...updateFields } = body;
        if (!id) {
            throw new HttpException('Result ID required', HttpStatus.BAD_REQUEST);
        }

        const validation = validateUpdateResult(updateFields);
        if (!validation.success) {
            throw new HttpException(validation.error, HttpStatus.BAD_REQUEST);
        }

        try {
            const updated = await this.resultService.updateResult(id, validation.data);
            return { success: true, result: updated };
        } catch (error: any) {
            const status = error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;
            throw new HttpException(error.message || 'Failed to update result', status);
        }
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT_AUTH')
    @ApiBody({ type: UpdateResultDto })
    @ApiResponse({ status: 200, description: 'Result updated by ID.' })
    async updateResultById(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() body: any,
    ) {
        const decoded = (req as any).user;
        await connectDB();

        if (decoded.role !== UserRole.ADMIN) {
            throw new HttpException('Forbidden: Admins only', HttpStatus.FORBIDDEN);
        }

        const validation = validateUpdateResult(body);
        if (!validation.success) {
            throw new HttpException(validation.error, HttpStatus.BAD_REQUEST);
        }

        try {
            const updated = await this.resultService.updateResult(id, validation.data);
            return { success: true, result: updated };
        } catch (error: any) {
            const status = error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;
            throw new HttpException(error.message || 'Failed to update result', status);
        }
    }

    @Delete()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT_AUTH')
    @ApiResponse({ status: 200, description: 'Result deleted.' })
    async deleteResult(@Req() req: Request, @Body() body: { id: string }) {
        const decoded = (req as any).user;
        await connectDB();

        if (decoded.role !== UserRole.ADMIN) {
            throw new HttpException('Forbidden: Admins only', HttpStatus.FORBIDDEN);
        }

        const { id } = body;
        if (!id) {
            throw new HttpException('Result ID required', HttpStatus.BAD_REQUEST);
        }

        try {
            await this.resultService.deleteResult(id);
            return { success: true, message: 'Result deleted' };
        } catch (error: any) {
            const status = error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;
            throw new HttpException(error.message || 'Failed to delete result', status);
        }
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT_AUTH')
    @ApiResponse({ status: 200, description: 'Result deleted by ID.' })
    async deleteResultById(@Req() req: Request, @Param('id') id: string) {
        const decoded = (req as any).user;
        await connectDB();

        if (decoded.role !== UserRole.ADMIN) {
            throw new HttpException('Forbidden: Admins only', HttpStatus.FORBIDDEN);
        }

        try {
            await this.resultService.deleteResult(id);
            return { success: true, message: 'Result deleted' };
        } catch (error: any) {
            const status = error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;
            throw new HttpException(error.message || 'Failed to delete result', status);
        }
    }
}
