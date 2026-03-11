import { Controller, Get, Post, Body } from '@nestjs/common';
import { MembersService } from './members.service';

@Controller('members')
export class MembersController {

  constructor(private membersService: MembersService) {}

  @Get()
  findAll() {
    return this.membersService.findAll();
  }

  @Post()
  create(@Body() data: any) {
    return this.membersService.create(data);
  }

}