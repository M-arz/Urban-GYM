import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Res,
    HttpStatus
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Response } from 'express';
import { firstValueFrom } from 'rxjs';

@Controller('bookings')
export class BookingsGatewayController {
    constructor(private readonly httpService: HttpService) { }

    private get baseUrl() {
        return process.env.BOOKING_SERVICE_URL || 'http://localhost:3002';
    }

    private async forwardRequest(method: 'get' | 'post' | 'put' | 'delete', url: string, data?: any, res?: Response) {
        try {
            const response = await firstValueFrom(
                this.httpService.request({
                    method,
                    url: `${this.baseUrl}${url}`,
                    data
                })
            );
            return res.status(response.status).json(response.data);
        } catch (e) {
            const status = e.response?.status || HttpStatus.BAD_GATEWAY;
            const message = e.response?.data || { message: 'Booking Service no disponible', error: e.message };
            return res.status(status).json(message);
        }
    }

    @Get()
    async findAll(@Res() res: Response) {
        return this.forwardRequest('get', '/bookings', null, res);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Res() res: Response) {
        return this.forwardRequest('get', `/bookings/${id}`, null, res);
    }

    @Post()
    async create(@Body() body: any, @Res() res: Response) {
        return this.forwardRequest('post', '/bookings', body, res);
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Res() res: Response) {
        return this.forwardRequest('delete', `/bookings/${id}`, null, res);
    }
}
