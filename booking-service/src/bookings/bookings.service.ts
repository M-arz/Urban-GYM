import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
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
        private httpService: HttpService,
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
        // Validar que la clase existe localmente
        const classGym = await this.classesRepository.findOneBy({ idClase: createBookingDto.claseId });
        if (!classGym) {
            throw new NotFoundException(`La clase con ID ${createBookingDto.claseId} no existe`);
        }

        // Validación Cross-Service: Verificar que el miembro existe llamando al Member Service
        try {
            const memberServiceUrl = process.env.MEMBER_SERVICE_URL || 'http://localhost:3001';
            await firstValueFrom(
                this.httpService.get(`${memberServiceUrl}/members/${createBookingDto.miembroId}`)
            );
        } catch (error: any) {
            // Si el error es 404, el usuario no existe en el Member Service
            if (error.response?.status === 404 || error.response?.status === 400) {
                throw new BadRequestException('El ID del miembro no es válido o no existe en el sistema');
            }
            // Si el Member Service está caído
            console.error('Error contactando al Member Service:', error.message);
            throw new InternalServerErrorException('Error validando el miembro. Servicio de miembros no disponible.');
        }

        const booking = this.bookingsRepository.create(createBookingDto);
        return this.bookingsRepository.save(booking);
    }

    async remove(id: string) {
        const booking = await this.findOne(id);
        return this.bookingsRepository.remove(booking);
    }
}
