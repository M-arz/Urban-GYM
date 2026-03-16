import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './booking.entity';

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

    create(data: Partial<Booking>) {
        const booking = this.bookingsRepository.create(data);
        return this.bookingsRepository.save(booking);
    }

    async remove(id: number) {
        const booking = await this.findOne(id);
        return this.bookingsRepository.remove(booking);
    }
}
