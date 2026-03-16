import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Reserva } from './reserva.entity';

@Entity('clases_gym')
export class Clase {

  @PrimaryGeneratedColumn()
  id_clase: number;

  @Column()
  nombre_clase: string;

  @Column()
  entrenador: string;

  @Column()
  capacidad: number;

  @OneToMany(() => Reserva, reserva => reserva.clase)
  reservas: Reserva[];

}