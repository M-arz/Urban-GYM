import { IsDateString, IsInt, IsUUID, Min } from 'class-validator';

export class CreateScheduleDto {
  @IsUUID()
  class_id: string;

  @IsDateString()
  date: string;

  @IsDateString()
  start_time: string;

  @IsInt()
  @Min(1)
  available_spots: number;
}
