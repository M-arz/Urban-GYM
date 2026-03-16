import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MembersGatewayModule } from './members/members-gateway.module';
import { BookingsGatewayModule } from './bookings/bookings-gateway.module';

@Module({
    imports: [HttpModule, MembersGatewayModule, BookingsGatewayModule],
})
export class AppModule { }
