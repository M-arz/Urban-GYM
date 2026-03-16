import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Clase } from './clase.entity';

@Entity('reserva')
export class Reserva {

  @PrimaryGeneratedColumn('uuid')
  id_reserva: string;

  @Column()
  miembro_id: string;

  @Column()
  fecha: Date;

  @Column()
  estado: string;

  @ManyToOne(() => Clase, clase => clase.reservas)
  @JoinColumn({ name: 'clase_id' })
  clase: Clase;

}