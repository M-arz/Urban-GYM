import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './role.entity';

@Entity('miembros')
export class Member {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ unique: true })
  email: string;

  @Column()
  contraseña: string;

  @Column()
  fecha_registro: Date;

  @ManyToOne(() => Role, role => role.miembros)
  @JoinColumn({ name: 'rol_id' })
  rol: Role;

}