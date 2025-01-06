import { Injectable } from '@nestjs/common'
import { GetPremiumInputDto } from './api/dto/input/GetPremiumInputDto'
import { PaymentSystemTypes } from '../../../../../libs/adapters/payments.adapter'
import { StripeService } from './modules/stripe/stripe.service'
import { PaypalService } from './modules/paypal/paypal.service'

@Injectable()
export class PaymentsService {
    constructor(
        private readonly stripeService: StripeService,
        private readonly paypalService: PaypalService
    ) {}

    getPremium(
        getPremiumInputDto: GetPremiumInputDto,
        userId: number
    ): Promise<{ url: string } | null> {
        switch (getPremiumInputDto.paymentSystem) {
            case PaymentSystemTypes.Stripe:
                return this.stripeService.createSession(
                    getPremiumInputDto,
                    userId
                )
            case PaymentSystemTypes.PayPal:
                return this.paypalService.createOrder(
                    getPremiumInputDto,
                    userId
                )
        }
    }
}
