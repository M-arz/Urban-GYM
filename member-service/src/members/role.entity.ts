import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Member } from './member.entity';

@Entity('roles_usuario')
export class Role {

  @PrimaryGeneratedColumn()
  id_rol: number;

  @Column()
  nombre_rol: string;

  @Column()
  descripcion: string;

  @OneToMany(() => Member, member => member.rol)
  miembros: Member[];

}