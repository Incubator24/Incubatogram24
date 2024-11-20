import { Injectable, Logger } from '@nestjs/common'
import { StripeService } from './stripe.service'
import { PrismaService } from '../../../../../../../prisma/prisma.service'
import { Order, Payment, Product } from '@prisma/client'
import { OrderStatusEnum } from '../../api/enum/orderStatusEnum'
import Stripe from 'stripe'

@Injectable()
export class StripeRepository {
    private readonly logger = new Logger(StripeService.name)

    constructor(private readonly prisma: PrismaService) {}

    async createOrder(
        subscriptionType: string,
        clientReferenceId: string,
        paymentSystemName: string,
        userId: number,
        productId: number,
        quantity: number
    ): Promise<Order | null> {
        const status = OrderStatusEnum.created
        const paymentSystem = await this.prisma.paymentSystem.findFirst({
            where: {
                name: paymentSystemName,
            },
        })
        try {
            const order = await this.prisma.order.create({
                data: {
                    subscriptionType: subscriptionType,
                    clientReferenceId: clientReferenceId,
                    paymentSystemId: paymentSystem.id,
                    userId: userId,
                    productId: productId,
                    quantity: quantity,
                    status: status,
                },
            })
            return order
        } catch (error) {
            this.logger.error(error)
            return null
        }
    }

    async getProduct(subscriptionName: string): Promise<Product> {
        return this.prisma.product.findFirst({
            where: {
                name: subscriptionName,
            },
        })
    }

    async createPayment(
        data: Stripe.Checkout.Session
    ): Promise<Payment | null> {
        const order = await this.prisma.order.findFirst({
            where: { clientReferenceId: data.client_reference_id },
            include: {
                product: true,
            },
        })
        if (!order) {
            return null
        }
        await this.prisma.order.updateMany({
            where: { clientReferenceId: data.client_reference_id },
            data: {
                status: OrderStatusEnum.done,
            },
        })
        this.logger.error(data)
        return this.prisma.payment.create({
            data: {
                status: order.status,
                paymentSystemId: order.paymentSystemId,
                orderId: order.id,
                dateOfPayment: new Date(data.created * 1000),
                endDateOfSubscription: new Date(data.expires_at * 1000),
                price: order.product.amount,
            },
        })
    }
}
