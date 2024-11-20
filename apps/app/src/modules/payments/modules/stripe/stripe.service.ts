import { Inject, Injectable, Logger } from '@nestjs/common'
import Stripe from 'stripe'
import { StripeRepository } from './stripe.repository'
import { GetPremiumInputDto } from '../../api/dto/input/GetPremiumInputDto'
import { v4 as uuidv4 } from 'uuid'
import Configuration from '../../../../../../../libs/config/configuration'

@Injectable()
export class StripeService {
    private readonly stripe: Stripe
    private readonly logger = new Logger(StripeService.name)

    constructor(
        @Inject('STRIPE_API_KEY') private readonly apiKey: string,
        @Inject('STRIPE_SIGNING_SECRET') private readonly signingSecret: string,
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
            const product = await this.stripeRepository.getProduct(
                getPremiumInputDto.subscriptionName
            )
            const quantity = 1
            this.logger.warn('product', product)
            const frontUrl = Configuration.getConfiguration().FRONT_URL
            const session = await this.stripe.checkout.sessions.create({
                success_url: frontUrl + '/stripe/success',
                cancel_url: frontUrl + '/stripe/cancel',
                line_items: [
                    {
                        // price: 'price_1QK16LE3a7cUSYV4DObnb97C',
                        price_data: {
                            product_data: {
                                name: product.name,
                                description:
                                    'It is description about my product',
                            },
                            unit_amount: product.amount * 100,
                            currency: product.currency,
                        },
                        quantity: quantity,
                    },
                ],
                mode: 'payment',
                client_reference_id: uuidv4(),
            })
            this.logger.log('session', session)

            if (!session) {
                return null
            }

            this.logger.warn('session.url', session.url)

            const order = await this.stripeRepository.createOrder(
                getPremiumInputDto.subscriptionName,
                session.client_reference_id,
                getPremiumInputDto.paymentSystem,
                userId,
                product.id,
                quantity
            )

            if (order) {
                return { url: session.url }
            }
        } catch (error) {
            this.logger.error(
                'Failed to fetch products from Stripe',
                error.stack
            )
            throw new Error('Unable to fetch products from Stripe')
        }
    }

    async workWithWebhook(data, signature) {
        try {
            const event = this.stripe.webhooks.constructEvent(
                data,
                signature,
                this.signingSecret
            )
            console.log('event ', event)

            if (event.type === 'checkout.session.completed') {
                this.logger.warn('data', data)

                const payment = await this.stripeRepository.createPayment(
                    event.data.object
                )
                this.logger.warn('payment', payment)
            }
        } catch (e) {
            return this.logger.error('payment not success', e)
        }
    }
}
