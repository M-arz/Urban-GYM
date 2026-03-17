import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookingsModule } from './bookings/bookings.module';
import { Booking } from './bookings/booking.entity';
import { ClassGym } from './bookings/class-gym.entity';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('DB_HOST') || 'localhost',
                port: configService.get<number>('DB_PORT') || 5432,
                username: configService.get<string>('DB_USER') || 'postgres',
                password: configService.get<string>('DB_PASSWORD') || '1234',
                database: configService.get<string>('DB_NAME') || 'bookings_db',
                entities: [Booking, ClassGym],
                autoLoadEntities: true,
                synchronize: false, // Evitar colisiones con tablas físicas
            }),
        }),
        BookingsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
