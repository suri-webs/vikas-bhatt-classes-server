import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    @Get()
    @ApiResponse({ status: 200, description: 'Check server status.' })
    getHealth() {
        return { success: true, message: 'Server is running' };
    }
}
