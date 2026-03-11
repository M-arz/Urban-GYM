import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
  rol: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_registro: Date;

}