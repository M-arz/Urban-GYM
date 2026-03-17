import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MembersGatewayModule } from './members/members-gateway.module';
import { BookingsGatewayModule } from './bookings/bookings-gateway.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        HttpModule,
        MembersGatewayModule,
        BookingsGatewayModule
    ],
})
export class AppModule { }
