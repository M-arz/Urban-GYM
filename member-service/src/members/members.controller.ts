import { Controller, Post, Get, Body } from '@nestjs/common';
import { MembersService } from './members.service';

@Controller('members')
export class MembersController {

  constructor(private readonly membersService: MembersService) {}

  @Post()
  createMember(@Body() data: any) {
    return this.membersService.create(data);
  }

  @Get()
  getMembers() {
    return this.membersService.findAll();
  }

}