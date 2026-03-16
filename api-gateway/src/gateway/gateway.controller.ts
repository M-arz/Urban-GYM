import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class GatewayController {

  @Get('members')
  getMembers() {
    return "Gateway conectado a member-service";
  }

  @Get('bookings')
  getBookings() {
    return "Gateway conectado a booking-service";
  }

  @Get('billing')
  getBilling() {
    return "Gateway conectado a billing-service";
  }

  @Get('workouts')
  getWorkouts() {
    return "Gateway conectado a workout-service";
  }

  @Get('recommendations')
  getRecommendations() {
    return "Gateway conectado a recommendation-service";
  }

}
