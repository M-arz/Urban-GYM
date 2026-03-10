import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Member {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  email: string;

  @Column()
  password: string;

}