import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BookingsGatewayController } from './bookings-gateway.controller';

@Module({
    imports: [HttpModule],
    controllers: [BookingsGatewayController],
})
export class BookingsGatewayModule { }
