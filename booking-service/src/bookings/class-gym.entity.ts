import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('clases_gym')
export class ClassGym {
    @PrimaryGeneratedColumn({ name: 'id_clase' })
    idClase: number;

    @Column({ name: 'nombre_clase' })
    nombreClase: string;

    @Column({ name: 'entrenador' })
    entrenador: string;

    @Column({ name: 'capacidad' })
    capacidad: number;
}
