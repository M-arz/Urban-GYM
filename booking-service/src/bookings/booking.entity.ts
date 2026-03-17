import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('reserva')
export class Booking {
    @PrimaryGeneratedColumn('uuid', { name: 'id_reserva' })
    idReserva: string;

    @Column({ name: 'clase_id' })
    claseId: number;

    @Column({ name: 'miembro_id' })
    miembroId: string;

    @Column({ type: 'timestamp', name: 'fecha', default: () => 'CURRENT_TIMESTAMP' })
    fecha: Date;

    @Column({ name: 'estado', default: 'confirmada' })
    estado: string;
}
