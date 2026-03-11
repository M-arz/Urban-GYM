import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './member.entity';

@Injectable()
export class MembersService {

  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  create(data: any) {
    const member = this.memberRepository.create(data);
    return this.memberRepository.save(member);
  }

  findAll() {
    return this.memberRepository.find();
  }

}