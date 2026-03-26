import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';

@Injectable()
export class BookingsService {
  constructor(private supabaseService: SupabaseService) {}

  async getClasses() {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('bookings')
      .from('classes')
      .select('*');
    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async getAllSchedules() {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('bookings')
      .from('schedules')
      .select('*, classes(name, instructor, duration_minutes, capacity)')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true });
    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async getSchedules() {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('bookings')
      .from('schedules')
      .select('*, classes(name, instructor, duration_minutes, capacity)')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true });
    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async createSchedule(createScheduleDto: CreateScheduleDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('bookings')
      .from('schedules')
      .insert(createScheduleDto)
      .select('*, classes(name, instructor)')
      .single();
    if (error) throw new ConflictException(error.message);
    return data;
  }

  async createBooking(createBookingDto: CreateBookingDto, memberId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: schedule } = await supabase
      .schema('bookings')
      .from('schedules')
      .select('*, classes(name)')
      .eq('id', createBookingDto.schedule_id)
      .single();

    if (!schedule) throw new NotFoundException('Horario no encontrado');
    if (schedule.available_spots <= 0) throw new BadRequestException('No hay cupos disponibles. Puedes unirte a la lista de espera.');

    const { data: existing } = await supabase
      .schema('bookings')
      .from('bookings')
      .select('id')
      .eq('schedule_id', createBookingDto.schedule_id)
      .eq('member_id', memberId)
      .eq('status', 'confirmed')
      .single();

    if (existing) throw new ConflictException('Ya tienes una reserva en este horario');

    const { data: booking, error } = await supabase
      .schema('bookings')
      .from('bookings')
      .insert({ schedule_id: createBookingDto.schedule_id, member_id: memberId })
      .select()
      .single();

    if (error) throw new ConflictException(error.message);

    await supabase
      .schema('bookings')
      .from('schedules')
      .update({ available_spots: schedule.available_spots - 1 })
      .eq('id', createBookingDto.schedule_id);

    return booking;
  }

  async getMyBookings(memberId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('bookings')
      .from('bookings')
      .select('*, schedules(date, start_time, classes(name, instructor, duration_minutes))')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false });
    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async cancelBooking(bookingId: string, memberId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: booking } = await supabase
      .schema('bookings')
      .from('bookings')
      .select('*, schedules(available_spots)')
      .eq('id', bookingId)
      .eq('member_id', memberId)
      .single();

    if (!booking) throw new NotFoundException('Reserva no encontrada');
    if (booking.status === 'cancelled') throw new BadRequestException('La reserva ya está cancelada');

    await supabase
      .schema('bookings')
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    const newSpots = booking.schedules.available_spots + 1;

    await supabase
      .schema('bookings')
      .from('schedules')
      .update({ available_spots: newSpots })
      .eq('id', booking.schedule_id);

    // Promover automáticamente al primero de la lista de espera
    const { data: nextInWaitlist } = await supabase
      .schema('bookings')
      .from('waitlist')
      .select('*')
      .eq('schedule_id', booking.schedule_id)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (nextInWaitlist) {
      await supabase
        .schema('bookings')
        .from('bookings')
        .insert({ schedule_id: booking.schedule_id, member_id: nextInWaitlist.member_id });

      await supabase
        .schema('bookings')
        .from('schedules')
        .update({ available_spots: newSpots - 1 })
        .eq('id', booking.schedule_id);

      await supabase
        .schema('bookings')
        .from('waitlist')
        .delete()
        .eq('id', nextInWaitlist.id);
    }

    return { message: 'Reserva cancelada correctamente' };
  }

  // Lista de espera
  async joinWaitlist(scheduleId: string, memberId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: schedule } = await supabase
      .schema('bookings')
      .from('schedules')
      .select('id, available_spots, classes(name)')
      .eq('id', scheduleId)
      .single();

    if (!schedule) throw new NotFoundException('Horario no encontrado');
    if (schedule.available_spots > 0) throw new BadRequestException('Aún hay cupos disponibles, puedes reservar directamente');

    const { data: existing } = await supabase
      .schema('bookings')
      .from('waitlist')
      .select('id')
      .eq('schedule_id', scheduleId)
      .eq('member_id', memberId)
      .single();

    if (existing) throw new ConflictException('Ya estás en la lista de espera para este horario');

    const { data, error } = await supabase
      .schema('bookings')
      .from('waitlist')
      .insert({ schedule_id: scheduleId, member_id: memberId })
      .select()
      .single();

    if (error) throw new ConflictException(error.message);
    return { message: 'Te has unido a la lista de espera', waitlist: data };
  }

  async getMyWaitlist(memberId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('bookings')
      .from('waitlist')
      .select('*, schedules(date, start_time, classes(name, instructor))')
      .eq('member_id', memberId)
      .order('created_at', { ascending: true });
    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async leaveWaitlist(waitlistId: string, memberId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: entry } = await supabase
      .schema('bookings')
      .from('waitlist')
      .select('id')
      .eq('id', waitlistId)
      .eq('member_id', memberId)
      .single();

    if (!entry) throw new NotFoundException('Entrada en lista de espera no encontrada');

    await supabase.schema('bookings').from('waitlist').delete().eq('id', waitlistId);
    return { message: 'Saliste de la lista de espera' };
  }
}
