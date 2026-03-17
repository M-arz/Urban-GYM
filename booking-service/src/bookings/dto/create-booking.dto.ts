import { IsInt, IsNotEmpty, IsString, Matches, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
    @IsInt({ message: 'El ID de la clase debe ser un número entero' })
    @IsNotEmpty({ message: 'El ID de la clase es requerido' })
    @Type(() => Number)
    claseId: number;

    @IsString({ message: 'El ID del miembro debe ser una cadena' })
    @IsNotEmpty({ message: 'El ID del miembro es requerido' })
    miembroId: string;
}
