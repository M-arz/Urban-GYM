import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { MercadoPagoModule } from '../mercado-pago/mercadopago.module';

@Module({
  imports: [SupabaseModule, MercadoPagoModule],
  controllers: [BillingController],
  providers: [BillingService],
})
export class BillingModule {}
