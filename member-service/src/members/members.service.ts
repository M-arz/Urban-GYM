import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
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
  async update(id: string, data: any) {
    // Si viene una nueva contraseña, verificar la actual y hashear la nueva
    if (data.newPassword) {
      const member = await this.membersRepository.findOne({ where: { id } });
      if (!member) throw new BadRequestException('Miembro no encontrado');

      if (!data.currentPassword) {
        throw new BadRequestException('Debes proporcionar la contraseña actual');
      }

      const isValid = await bcrypt.compare(data.currentPassword, member.password);
      if (!isValid) {
        throw new UnauthorizedException('La contraseña actual es incorrecta');
      }

      data.password = await bcrypt.hash(data.newPassword, 10);
      delete data.currentPassword;
      delete data.newPassword;
    } else {
      // Si no cambia contraseña, nunca guardar el campo password (evita sobreescribir)
      delete data.password;
      delete data.currentPassword;
      delete data.newPassword;
    }

    await this.membersRepository.update(id, data);
    return this.membersRepository.findOne({ where: { id }, relations: ['rol'] });
  }

  // Eliminar
  remove(id: string) {
    return this.membersRepository.delete(id);
  }

}