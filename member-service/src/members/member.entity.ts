import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
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
  password: string;

  @CreateDateColumn()
  fecha_registro: Date;

  @ManyToOne(() => Role, role => role.miembros, { nullable: true })
  @JoinColumn({ name: 'rol_id' })
  rol: Role;

}