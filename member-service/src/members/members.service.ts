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

  // Crear miembro
  create(data: any) {
    return this.membersRepository.save(data);
  }

  // Login
  login(data: any) {
    return this.membersRepository.findOne({
      where: { email: data.email },
      relations: ['rol']
    });
  }

  // Obtener todos
  findAll() {
    return this.membersRepository.find({
      relations: ['rol']
    });
  }

  // Obtener uno
  findOne(id: string) {
    return this.membersRepository.findOne({
      where: { id },
      relations: ['rol']
    });
  }

  // Actualizar
  update(id: string, data: any) {
    return this.membersRepository.update(id, data);
  }

  // Eliminar
  remove(id: string) {
    return this.membersRepository.delete(id);
  }

}