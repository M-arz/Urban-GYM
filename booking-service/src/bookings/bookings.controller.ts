import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    ParseIntPipe,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { Booking } from './booking.entity';

@Controller('bookings')
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) { }

    @Get()
    findAll() {
        return this.bookingsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.bookingsService.findOne(id);
    }

    @Post()
    create(@Body() data: Partial<Booking>) {
        return this.bookingsService.create(data);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.bookingsService.remove(id);
    }
}
