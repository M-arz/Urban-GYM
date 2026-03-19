import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from './booking.entity';
import { ClassGym } from './class-gym.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Booking, ClassGym]),
        HttpModule
    ],
    controllers: [BookingsController],
    providers: [BookingsService],
})
export class BookingsModule { }
