import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './member.entity';

@Injectable()
export class MembersService {

  constructor(
    @InjectRepository(Member)
    private membersRepository: Repository<Member>,
  ) {}

  create(data: any) {
    const member = this.membersRepository.create(data);
    return this.membersRepository.save(member);
  }

  findAll() {
    return this.membersRepository.find();
  }

}