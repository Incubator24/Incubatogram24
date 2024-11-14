import { Module } from '@nestjs/common'
import { StripeModule } from './modules/stripe/stripe.module'
import { PaymentsController } from './payments.controller'
import { PaymentsService } from './payments.service'

@Module({
    imports: [StripeModule.forRootAsync()],
    controllers: [PaymentsController],
    providers: [PaymentsService],
})
export class PaymentsModule {}
