import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BillingController } from './billing/billing.controller';
import { BillingService } from './billing/billing.service';

@Module({
  imports: [],
  controllers: [AppController, BillingController],
  providers: [AppService, BillingService],
})
export class AppModule {}
