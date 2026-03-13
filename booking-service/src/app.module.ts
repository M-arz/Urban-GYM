import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsModule } from './bookings/bookings.module';
import { Reserva } from './bookings/reserva.entity';
import { Clase } from './bookings/clase.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'bookings_db',
      entities: [Reserva, Clase],
      synchronize: true,
    }),
    BookingsModule,
  ],
})
export class AppModule {}