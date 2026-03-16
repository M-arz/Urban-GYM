import { Controller, Get } from '@nestjs/common';

@Controller('recommendations')
export class RecommendationsController {

  @Get()
  getRecommendations() {
    return "Lista de recomendaciones de entrenamiento";
  }

}