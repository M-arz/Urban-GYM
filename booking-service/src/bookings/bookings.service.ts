import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './booking.entity';
import { ClassGym } from './class-gym.entity';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
    constructor(
        @InjectRepository(Booking)
        private bookingsRepository: Repository<Booking>,
        @InjectRepository(ClassGym)
        private classesRepository: Repository<ClassGym>,
    ) { }

    async getAvailableClasses() {
        const classes = await this.classesRepository.find();
        if (classes.length === 0) {
            // Si está vacía, insertamos unas por defecto para que el usuario las vea
            const defaultClasses = [
                { nombreClase: 'Yoga Flow', entrenador: 'Ana Silva', capacidad: 20 },
                { nombreClase: 'CrossFit', entrenador: 'Marco Diaz', capacidad: 15 },
                { nombreClase: 'Spinning', entrenador: 'Lucia Pérez', capacidad: 25 },
                { nombreClase: 'Boxeo', entrenador: 'Raul Gomez', capacidad: 12 },
            ];
            await this.classesRepository.save(defaultClasses);
            return this.classesRepository.find();
        }
        return classes;
    }

    findAll() {
        return this.bookingsRepository.find();
    }

    async findOne(id: string) {
        const booking = await this.bookingsRepository.findOneBy({ idReserva: id });
        if (!booking) throw new NotFoundException(`Booking #${id} no encontrada`);
        return booking;
    }

    async create(createBookingDto: CreateBookingDto) {
        const booking = this.bookingsRepository.create(createBookingDto);
        return this.bookingsRepository.save(booking);
    }

    async remove(id: string) {
        const booking = await this.findOne(id);
        return this.bookingsRepository.remove(booking);
    }
}
