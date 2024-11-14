import { Inject, Injectable, Logger } from '@nestjs/common'
import Stripe from 'stripe'
import { StripeRepository } from './stripe.repository'
import { GetPremiumInputDto } from '../../api/dto/input/GetPremiumInputDto'

@Injectable()
export class StripeService {
    private readonly stripe: Stripe
    private readonly logger = new Logger(StripeService.name)

    constructor(
        @Inject('STRIPE_API_KEY') private readonly apiKey: string,
        private readonly stripeRepository: StripeRepository
    ) {
        this.stripe = new Stripe(this.apiKey, {
            apiVersion: '2024-10-28.acacia',
        })
        this.logger.log('StripeService initialized with API version 2023-10-16')
    }

    async createSession(
        getPremiumInputDto: GetPremiumInputDto,
        userId: number
    ): Promise<{ url: string } | null> {
        try {
            const session = await this.stripe.checkout.sessions.create({
                success_url: 'http://localhost:3001/success',
                cancel_url: 'http://localhost:3001/cancel',
                line_items: [
                    {
                        // price: 'price_1QK16LE3a7cUSYV4DObnb97C',
                        price_data: {
                            product_data: {
                                name: 'ProductId',
                                description:
                                    'It is description about my product',
                            },
                            unit_amount: 100 * 100,
                            currency: 'USD',
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                client_reference_id: '12',
            })
            this.logger.log('session', session)

            if (!session) {
                return null
            }

            this.logger.warn('session.url', session.url)

            this.stripeRepository.createOrder()

            return { url: session.url }
        } catch (error) {
            this.logger.error(
                'Failed to fetch products from Stripe',
                error.stack
            )
            throw new Error('Unable to fetch products from Stripe')
        }
    }

    async workWithWebhook(data, signature) {
        const signingSecret = 'whsec_87UUBudfJctHdIzLXWzdhpE4MyB99oPI'

        try {
            const event = this.stripe.webhooks.constructEvent(
                data,
                signature,
                signingSecret
            )
            console.log('event', event)

            if (event.type === 'checkout.session.completed') {
                //todo создать платёж

                // this.finishPaymentUseCase(
                //     event.data.object.client_reference_id,
                //     event
                // )
                this.logger.log('payment success')
            }
        } catch (e) {
            return this.logger.error('payment not success', e)
        }
    }
}
