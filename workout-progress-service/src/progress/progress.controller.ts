import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { RecordWorkoutDto } from './dto/record-workout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  // Endpoint interno: migra workouts históricos del IoT service
  @Post('migrate')
  async migrate(@Headers('x-internal-key') internalKey: string) {
    if (internalKey !== process.env.INTERNAL_SECRET) {
      throw new UnauthorizedException('Clave interna inválida');
    }
    return this.progressService.migrateFromIot();
  }

  // Endpoint interno: llamado por el IoT service al completar un workout
  @Post('workout')
  async recordWorkout(
    @Body() dto: RecordWorkoutDto,
    @Headers('x-internal-key') internalKey: string,
  ) {
    if (internalKey !== process.env.INTERNAL_SECRET) {
      throw new UnauthorizedException('Clave interna inválida');
    }
    return this.progressService.recordWorkout(dto);
  }

  // Historial del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyHistory(@Request() req: any) {
    return this.progressService.getHistory(req.user.id);
  }

  // Stats del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get('me/stats')
  async getMyStats(@Request() req: any) {
    return this.progressService.getStats(req.user.id);
  }

  // Récords personales del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get('me/records')
  async getMyRecords(@Request() req: any) {
    return this.progressService.getPersonalRecords(req.user.id);
  }

  // Admin/Trainer: historial de cualquier miembro
  @UseGuards(JwtAuthGuard)
  @Get(':memberId')
  async getMemberHistory(@Param('memberId') memberId: string) {
    return this.progressService.getHistory(memberId);
  }

  // Admin/Trainer: stats de cualquier miembro
  @UseGuards(JwtAuthGuard)
  @Get(':memberId/stats')
  async getMemberStats(@Param('memberId') memberId: string) {
    return this.progressService.getStats(memberId);
  }

  // Admin/Trainer: récords de cualquier miembro
  @UseGuards(JwtAuthGuard)
  @Get(':memberId/records')
  async getMemberRecords(@Param('memberId') memberId: string) {
    return this.progressService.getPersonalRecords(memberId);
  }
}
