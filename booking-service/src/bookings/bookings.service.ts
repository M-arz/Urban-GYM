import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
    constructor(
        @InjectRepository(Booking)
        private bookingsRepository: Repository<Booking>,
    ) { }

    findAll() {
        return this.bookingsRepository.find();
    }

    async findOne(id: number) {
        const booking = await this.bookingsRepository.findOneBy({ id });
        if (!booking) throw new NotFoundException(`Booking #${id} no encontrada`);
        return booking;
    }

    create(createBookingDto: CreateBookingDto) {
        const booking = this.bookingsRepository.create(createBookingDto);
        return this.bookingsRepository.save(booking);
    }

    async remove(id: number) {
        const booking = await this.findOne(id);
        return this.bookingsRepository.remove(booking);
    }
}
