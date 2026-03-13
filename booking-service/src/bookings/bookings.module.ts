import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Reserva } from './reserva.entity';
import { Clase } from './clase.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reserva, Clase])],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'booking_db',
      entities: [Reserva, Clase],
      synchronize: true,
    }),
    BookingsModule,
  ],
})
export class AppModule {}