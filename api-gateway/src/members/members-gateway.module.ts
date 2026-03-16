import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MembersGatewayController } from './members-gateway.controller';

@Module({
    imports: [HttpModule],
    controllers: [MembersGatewayController],
})
export class MembersGatewayModule { }
