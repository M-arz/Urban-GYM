import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Booking {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    memberId: number;

    @Column()
    fecha: string;

    @Column()
    hora: string;

    @Column()
    tipo: string;
}
