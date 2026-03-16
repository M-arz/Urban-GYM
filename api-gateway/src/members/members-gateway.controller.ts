import {
    Controller,
    Get,
    Post,
    Body,
    Req,
    Res,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

const MEMBER_SERVICE_URL = 'http://localhost:3001';

@Controller('members')
export class MembersGatewayController {
    constructor(private readonly httpService: HttpService) { }

    @Get()
    async findAll(@Res() res: Response) {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${MEMBER_SERVICE_URL}/members`),
            );
            return res.json(data);
        } catch (e) {
            return res.status(502).json({ message: 'Member Service no disponible', error: e.message });
        }
    }

    @Post()
    async create(@Body() body: any, @Res() res: Response) {
        try {
            const { data } = await firstValueFrom(
                this.httpService.post(`${MEMBER_SERVICE_URL}/members`, body),
            );
            return res.json(data);
        } catch (e) {
            return res.status(502).json({ message: 'Member Service no disponible', error: e.message });
        }
    }
}
