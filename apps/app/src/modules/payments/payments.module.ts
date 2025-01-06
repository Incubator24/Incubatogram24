import { Module } from '@nestjs/common'
import { StripeModule } from './modules/stripe/stripe.module'
import { PaymentsController } from './payments.controller'
import { PaymentsService } from './payments.service'
import { PaypalService } from './modules/paypal/paypal.service'
import { PrismaService } from '../../../../../prisma/prisma.service'

@Module({
    imports: [StripeModule.forRootAsync()],
    controllers: [PaymentsController],
    providers: [PaymentsService, PaypalService, PrismaService],
})
export class PaymentsModule {}
