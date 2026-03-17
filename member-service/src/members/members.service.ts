import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './member.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateMemberDto } from './dto/create-member.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class MembersService {

  constructor(
    @InjectRepository(Member)
    private membersRepository: Repository<Member>,
    private jwtService: JwtService,
  ) {}

  // Crear miembro (Registro)
  async create(createMemberDto: CreateMemberDto) {
    const existingMember = await this.membersRepository.findOne({ where: { email: createMemberDto.email } });
    if (existingMember) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createMemberDto.password, saltRounds);

    const newMember = this.membersRepository.create({
      ...createMemberDto,
      password: hashedPassword,
    });

    const savedMember = await this.membersRepository.save(newMember);
    const { password, ...result } = savedMember;
    return result;
  }

  // Login
  async login(loginDto: LoginDto) {
    const member = await this.membersRepository.findOne({
      where: { email: loginDto.email },
      relations: ['rol']
    });

    if (!member) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, member.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: member.id, email: member.email, rol: member.rol?.nombre_rol || 'user' };
    
    return {
      access_token: this.jwtService.sign(payload),
      member: {
        id: member.id,
        nombre: member.nombre,
        email: member.email,
        rol: member.rol
      }
    };
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