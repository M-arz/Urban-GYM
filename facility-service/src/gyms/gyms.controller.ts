import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { GymsService } from './gyms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('gyms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GymsController {
  constructor(private gymsService: GymsService) {}

  // Cualquier usuario autenticado puede ver todas las sedes
  @Get()
  findAll() {
    return this.gymsService.findAll();
  }

  // Sedes actualmente abiertas
  @Get('open')
  findOpen() {
    return this.gymsService.findOpen();
  }

  // Detalle de una sede (con equipamiento)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gymsService.findOne(id);
  }

  // Solo admin puede crear, actualizar o eliminar sedes
  @Post()
  @Roles('admin')
  create(@Body(ValidationPipe) body: any) {
    return this.gymsService.create(body);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body(ValidationPipe) body: any) {
    return this.gymsService.update(id, body);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.gymsService.remove(id);
  }
}
