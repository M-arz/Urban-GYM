import { Controller, Get } from '@nestjs/common';

@Controller('billing')
export class BillingController {

  @Get()
  getPayments() {
    return "Lista de pagos";
  }

}