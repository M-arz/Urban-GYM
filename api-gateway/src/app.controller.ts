import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      gateway: 'API Gateway - UrbanGym',
      services: {
        memberService:
          process.env.MEMBER_SERVICE_URL || 'http://localhost:3001',
        bookingService:
          process.env.BOOKING_SERVICE_URL || 'http://localhost:3002',
      },
      routes: {
        '/auth/*': 'member-service',
        '/members/*': 'member-service',
        '/classes': 'booking-service',
        '/schedules': 'booking-service',
        '/bookings/*': 'booking-service',
      },
    };
  }
}
