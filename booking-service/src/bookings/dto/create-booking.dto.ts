import { IsInt, IsNotEmpty, IsString, Matches, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
    @IsInt({ message: 'El ID del miembro debe ser un número entero' })
    @Type(() => Number)
    @IsNotEmpty({ message: 'El ID del miembro es requerido' })
    memberId: number;

    @IsString()
    @IsNotEmpty({ message: 'La fecha es requerida' })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha debe tener el formato YYYY-MM-DD' })
    fecha: string;

    @IsString()
    @IsNotEmpty({ message: 'La hora es requerida' })
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'La hora debe tener el formato HH:mm' })
    hora: string;

    @IsString()
    @IsNotEmpty({ message: 'El tipo de clase es requerido' })
    @IsIn(['Yoga', 'CrossFit', 'Spinning', 'Pilates', 'Boxeo'], { message: 'El tipo de clase no es válido' })
    tipo: string;
}
