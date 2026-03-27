import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import type { RawWorkoutData } from './workouts.service';
import { WorkoutsService } from './workouts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('workouts')
export class WorkoutsController {
  constructor(private workoutsService: WorkoutsService) {}

  // Máquina envía datos de entrenamiento con API Key
  @Post()
  @UseGuards(ApiKeyGuard)
  recordWorkout(@Request() req: any, @Body() body: RawWorkoutData) {
    return this.workoutsService.recordWorkout(req.machine, body);
  }

  // Admin y trainer ven todos los entrenamientos
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'trainer')
  findAll() {
    return this.workoutsService.findAll();
  }

  // Estadísticas de un socio (cualquier usuario autenticado)
  @Get('stats/:memberId')
  @UseGuards(JwtAuthGuard)
  getStats(@Param('memberId') memberId: string) {
    return this.workoutsService.getStats(memberId);
  }

  // Entrenamientos de un socio
  @Get('member/:memberId')
  @UseGuards(JwtAuthGuard)
  findByMember(@Param('memberId') memberId: string) {
    return this.workoutsService.findByMember(memberId);
  }
}
