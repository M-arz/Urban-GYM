import { Controller, Post, Get, Body, Param, Put, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { LoginDto } from './dto/login.dto';

@Controller()
export class MembersController {

  constructor(private readonly membersService: MembersService) {}

  // Registro
  @Post('auth/register')
  register(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  // Login
  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.membersService.login(loginDto);
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