import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from './booking.entity';
import { ClassGym } from './class-gym.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Booking, ClassGym])],
    controllers: [BookingsController],
    providers: [BookingsService],
})
export class BookingsModule { }
