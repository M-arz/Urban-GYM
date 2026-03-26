import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Get('classes')
  getClasses() {
    return this.bookingsService.getClasses();
  }

  @Get('schedules')
  getSchedules() {
    return this.bookingsService.getSchedules();
  }

  @Post('schedules')
  createSchedule(@Body(ValidationPipe) createScheduleDto: CreateScheduleDto) {
    return this.bookingsService.createSchedule(createScheduleDto);
  }

  @Post('bookings')
  createBooking(@Body(ValidationPipe) createBookingDto: CreateBookingDto, @Request() req) {
    return this.bookingsService.createBooking(createBookingDto, req.user.id);
  }

  @Get('bookings/my')
  getMyBookings(@Request() req) {
    return this.bookingsService.getMyBookings(req.user.id);
  }

  @Delete('bookings/:id')
  cancelBooking(@Param('id') id: string, @Request() req) {
    return this.bookingsService.cancelBooking(id, req.user.id);
  }

  // Lista de espera
  @Post('waitlist')
  joinWaitlist(@Body('schedule_id') scheduleId: string, @Request() req) {
    return this.bookingsService.joinWaitlist(scheduleId, req.user.id);
  }

  @Get('waitlist/my')
  getMyWaitlist(@Request() req) {
    return this.bookingsService.getMyWaitlist(req.user.id);
  }

  @Delete('waitlist/:id')
  leaveWaitlist(@Param('id') id: string, @Request() req) {
    return this.bookingsService.leaveWaitlist(id, req.user.id);
  }
}
