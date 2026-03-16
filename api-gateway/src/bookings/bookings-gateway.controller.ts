import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Res,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Response } from 'express';
import { firstValueFrom } from 'rxjs';

const BOOKING_SERVICE_URL = 'http://localhost:3002';

@Controller('bookings')
export class BookingsGatewayController {
    constructor(private readonly httpService: HttpService) { }

    @Get()
    async findAll(@Res() res: Response) {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${BOOKING_SERVICE_URL}/bookings`),
            );
            return res.json(data);
        } catch (e) {
            return res.status(502).json({ message: 'Booking Service no disponible', error: e.message });
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Res() res: Response) {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${BOOKING_SERVICE_URL}/bookings/${id}`),
            );
            return res.json(data);
        } catch (e) {
            return res.status(502).json({ message: 'Booking Service no disponible', error: e.message });
        }
    }

    @Post()
    async create(@Body() body: any, @Res() res: Response) {
        try {
            const { data } = await firstValueFrom(
                this.httpService.post(`${BOOKING_SERVICE_URL}/bookings`, body),
            );
            return res.json(data);
        } catch (e) {
            return res.status(502).json({ message: 'Booking Service no disponible', error: e.message });
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Res() res: Response) {
        try {
            const { data } = await firstValueFrom(
                this.httpService.delete(`${BOOKING_SERVICE_URL}/bookings/${id}`),
            );
            return res.json(data);
        } catch (e) {
            return res.status(502).json({ message: 'Booking Service no disponible', error: e.message });
        }
    }
}
