import { Controller, Post, Get, Body, Param, Put, Delete } from '@nestjs/common';
import { MembersService } from './members.service';

@Controller()
export class MembersController {

  constructor(private readonly membersService: MembersService) {}

  // Registro
  @Post('auth/register')
  register(@Body() data: any) {
    return this.membersService.create(data);
  }

  // Login
  @Post('auth/login')
  login(@Body() data: any) {
    return this.membersService.login(data);
  }

  // Obtener todos
  @Get('members')
  getMembers() {
    return this.membersService.findAll();
  }

  // Obtener uno
  @Get('members/:id')
  getMember(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  // Actualizar
  @Put('members/:id')
  updateMember(@Param('id') id: string, @Body() data: any) {
    return this.membersService.update(id, data);
  }

  // Eliminar
  @Delete('members/:id')
  deleteMember(@Param('id') id: string) {
    return this.membersService.remove(id);
  }

}