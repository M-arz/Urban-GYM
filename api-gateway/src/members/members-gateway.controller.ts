import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Res,
    HttpStatus
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Response } from 'express';
import { firstValueFrom } from 'rxjs';

@Controller()
export class MembersGatewayController {
    
    constructor(private readonly httpService: HttpService) { }

    private get baseUrl() {
        return process.env.MEMBER_SERVICE_URL || 'http://localhost:3001';
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
            const message = e.response?.data || { message: 'Member Service no disponible', error: e.message };
            return res.status(status).json(message);
        }
    }

    // Auth
    @Post('auth/register')
    async register(@Body() body: any, @Res() res: Response) {
        return this.forwardRequest('post', '/auth/register', body, res);
    }

    @Post('auth/login')
    async login(@Body() body: any, @Res() res: Response) {
        return this.forwardRequest('post', '/auth/login', body, res);
    }

    // CRUD Members
    @Get('members')
    async findAll(@Res() res: Response) {
        return this.forwardRequest('get', '/members', null, res);
    }

    @Get('members/:id')
    async findOne(@Param('id') id: string, @Res() res: Response) {
        return this.forwardRequest('get', `/members/${id}`, null, res);
    }

    @Put('members/:id')
    async update(@Param('id') id: string, @Body() body: any, @Res() res: Response) {
        return this.forwardRequest('put', `/members/${id}`, body, res);
    }

    @Delete('members/:id')
    async remove(@Param('id') id: string, @Res() res: Response) {
        return this.forwardRequest('delete', `/members/${id}`, null, res);
    }
}
