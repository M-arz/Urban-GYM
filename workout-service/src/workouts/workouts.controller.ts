import { Controller, Get } from '@nestjs/common';

@Controller('workouts')
export class WorkoutsController {

  @Get()
  getWorkouts() {
    return "Lista de entrenamientos";
  }

}