import { Controller, Post, Get, Body, Param, Delete } from '@nestjs/common';
import { BookingsService } from './bookings.service';

@Controller('bookings')
export class BookingsController {

  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() data: any) {
    return this.bookingsService.create(data);
  }

  @Get()
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }

}