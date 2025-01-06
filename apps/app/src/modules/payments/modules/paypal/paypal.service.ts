// import { Inject, Injectable, Logger } from '@nestjs/common'
// import * as paypal from '@paypal/checkout-server-sdk'
// import { GetPremiumInputDto } from '../../api/dto/input/GetPremiumInputDto'
// import { Product } from '@prisma/client'
// import { PayPalRepository } from './paypal.repository'
//
// @Injectable()
// export class PayPalService {
//     private readonly logger = new Logger(PayPalService.name)
//     private readonly client: paypal.core.PayPalHttpClient
//
//     constructor(
//         @Inject('PAYPAL_CLIENT_ID') private readonly clientId: string,
//         @Inject('PAYPAL_CLIENT_SECRET') private readonly clientSecret: string,
//         private readonly paypalRepository: PayPalRepository,
//         private readonly productRepository: ProductRepository
//     ) {
//         const environment = new paypal.core.SandboxEnvironment(
//             this.clientId,
//             this.clientSecret
//         )
//         this.client = new paypal.core.PayPalHttpClient(environment)
//         this.logger.log('PayPalService initialized.')
//     }
//
//     async createSession(
//         getPremiumInputDto: GetPremiumInputDto,
//         userId: number
//     ): Promise<{ url: string } | null> {
//         try {
//             const product = await this.paypalRepository.getProduct(
//                 getPremiumInputDto.subscriptionName
//             )
//             const frontUrl = 'http://localhost:3000/my-profile/'
//
//             const request = new paypal.orders.OrdersCreateRequest()
//             request.requestBody({
//                 intent: 'CAPTURE',
//                 purchase_units: [
//                     {
//                         amount: {
//                             currency_code: product.currency,
//                             value: product.amount.toString(),
//                         },
//                         description: 'Premium subscription',
//                     },
//                 ],
//                 application_context: {
//                     brand_name: 'YourAppName',
//                     landing_page: 'BILLING',
//                     user_action: 'PAY_NOW',
//                     return_url: `${frontUrl}${userId}/settings/management?paymentStatus=success`,
//                     cancel_url: `${frontUrl}${userId}/settings/management?paymentStatus=cancel`,
//                 },
//             })
//
//             const response = await this.client.execute(request)
//             const orderId = response.result.id
//             const approvalLink = response.result.links.find(
//                 (link) => link.rel === 'approve'
//             )?.href
//
//             if (!approvalLink) {
//                 throw new Error('No approval link found in PayPal response')
//             }
//
//             await this.paypalRepository.createOrder(
//                 getPremiumInputDto.subscriptionName,
//                 orderId,
//                 'PayPal',
//                 userId,
//                 product.id,
//                 1 // quantity
//             )
//
//             return { url: approvalLink }
//         } catch (error) {
//             this.logger.error('Failed to create PayPal session', error.stack)
//             return {
//                 url: `http://localhost:3000/my-profile/${userId}/settings/management?paymentStatus=error`,
//             }
//         }
//     }
//
//     async workWithWebhook(event: any): Promise<void> {
//         try {
//             if (event.event_type === 'CHECKOUT.ORDER.APPROVED') {
//                 const orderId = event.resource.id
//
//                 const order = await this.paypalRepository.getOrder(orderId)
//                 if (!order) {
//                     this.logger.error('Order not found for orderId:', orderId)
//                     return
//                 }
//
//                 await this.paypalRepository.updateOrderStatus(orderId, 'done')
//                 await this.paypalRepository.createPayment(order, new Date())
//                 this.logger.log(
//                     'Payment processed successfully for orderId:',
//                     orderId
//                 )
//             }
//         } catch (error) {
//             this.logger.error('Error handling PayPal webhook', error.stack)
//         }
//     }
// }
// import { Injectable, Logger } from '@nestjs/common'
// import paypal from '@paypal/checkout-server-sdk'
// import { PrismaService } from '../../../../../../../prisma/prisma.service'
// import { Order, Payment } from '@prisma/client'
//
// @Injectable()
// export class PaypalService {
//     private readonly paypalClient: paypal.core.PayPalHttpClient
//     private readonly logger = new Logger(PaypalService.name)
//
//     constructor(private readonly prisma: PrismaService) {
//         const environment = new paypal.core.SandboxEnvironment(
//             process.env.PAYPAL_CLIENT_ID,
//             process.env.PAYPAL_CLIENT_SECRET
//         )
//         this.paypalClient = new paypal.core.PayPalHttpClient(environment)
//         this.logger.log('PaypalService initialized')
//     }
//
//     // Создание заказа в базе данных
//     async createOrderInDB(
//         subscriptionType: string,
//         userId: number,
//         productId: number,
//         paymentSystemId: number
//     ): Promise<Order | null> {
//         try {
//             return await this.prisma.order.create({
//                 data: {
//                     subscriptionType,
//                     userId,
//                     productId,
//                     paymentSystemId,
//                     status: 'created',
//                     quantity: 1, // Например, один товар
//                     clientReferenceId: '', // Это обновится после создания заказа в PayPal
//                 },
//             })
//         } catch (error) {
//             this.logger.error('Error creating order in DB', error)
//             return null
//         }
//     }
//
//     // Создание заказа в PayPal
//     async createOrder(
//         subscriptionType: string,
//         userId: number
//     ): Promise<{ id: string; url: string } | null> {
//         try {
//             // Получение продукта и платёжной системы
//             const product = await this.prisma.product.findFirst({
//                 where: { name: subscriptionType },
//             })
//
//             const paymentSystem = await this.prisma.paymentSystem.findFirst({
//                 where: { name: 'PayPal' },
//             })
//
//             if (!product || !paymentSystem) {
//                 this.logger.error('Product or PaymentSystem not found')
//                 return null
//             }
//
//             // Создание заказа в базе данных
//             const order = await this.createOrderInDB(
//                 subscriptionType,
//                 userId,
//                 product.id,
//                 paymentSystem.id
//             )
//
//             if (!order) {
//                 this.logger.error('Failed to create order in DB')
//                 return null
//             }
//
//             // Создание заказа в PayPal
//             const request = new paypal.orders.OrdersCreateRequest()
//             request.requestBody({
//                 intent: 'CAPTURE',
//                 purchase_units: [
//                     {
//                         amount: {
//                             currency_code: product.currency,
//                             value: (product.amount / 100).toFixed(2), // Преобразуем цену в доллары
//                         },
//                     },
//                 ],
//             })
//
//             const response = await this.paypalClient.execute(request)
//
//             // Обновление clientReferenceId в базе данных
//             await this.prisma.order.update({
//                 where: { id: order.id },
//                 data: {
//                     clientReferenceId: response.result.id,
//                 },
//             })
//
//             const approveLink = response.result.links?.find(
//                 (link) => link.rel === 'approve'
//             )?.href
//
//             if (approveLink) {
//                 return { id: response.result.id, url: approveLink }
//             }
//
//             this.logger.error('No approve link found in PayPal response')
//             return null
//         } catch (error) {
//             this.logger.error('Error creating PayPal order', error)
//             return null
//         }
//     }
//
//     // Захват заказа (Capture Order) в PayPal
//     async captureOrder(orderId: string): Promise<Payment | null> {
//         try {
//             const request = new paypal.orders.OrdersCaptureRequest(orderId)
//             request.requestBody({})
//
//             const response = await this.paypalClient.execute(request)
//
//             // Поиск заказа в базе данных
//             const order = await this.prisma.order.findFirst({
//                 where: { clientReferenceId: orderId },
//             })
//
//             if (!order) {
//                 this.logger.error('Order not found for PayPal capture')
//                 return null
//             }
//
//             // Обновление статуса заказа
//             await this.prisma.order.update({
//                 where: { id: order.id },
//                 data: { status: 'done' },
//             })
//
//             // Создание платежа
//             return this.createPayment(
//                 order,
//                 new Date(response.result.update_time)
//             )
//         } catch (error) {
//             this.logger.error('Error capturing PayPal order', error)
//             return null
//         }
//     }
//
//     // Создание платежа
//     async createPayment(
//         order: Order,
//         dateOfPayment: Date
//     ): Promise<Payment | null> {
//         try {
//             return this.prisma.payment.create({
//                 data: {
//                     status: order.status,
//                     paymentSystemId: order.paymentSystemId,
//                     orderId: order.id,
//                     dateOfPayment,
//                     endDateOfSubscription: new Date(
//                         dateOfPayment.getTime() + 30 * 24 * 60 * 60 * 1000 // Добавляем 30 дней
//                     ),
//                     price: order.quantity * 100, // Предполагаем цену товара в базовой валюте
//                 },
//             })
//         } catch (error) {
//             this.logger.error('Error creating payment', error)
//             return null
//         }
//     }
// }

import { Injectable, Logger } from '@nestjs/common'
import * as paypal from '@paypal/checkout-server-sdk'
import { PrismaService } from '../../../../../../../prisma/prisma.service'
import { GetPremiumInputDto } from '../../api/dto/input/GetPremiumInputDto'

@Injectable()
export class PaypalService {
    private readonly paypalClient: paypal.core.PayPalHttpClient
    private readonly logger = new Logger(PaypalService.name)

    constructor(private readonly prisma: PrismaService) {
        const environment = new paypal.core.SandboxEnvironment(
            process.env.PAYPAL_CLIENT_ID,
            process.env.PAYPAL_CLIENT_SECRET
        )
        this.paypalClient = new paypal.core.PayPalHttpClient(environment)
    }

    // Создание заказа в PayPal
    async createOrder(
        getPremiumInputDto: GetPremiumInputDto,
        userId: number
    ): Promise<{ id: string; url: string } | null> {
        try {
            // Получение продукта из DTO
            const product = await this.prisma.product.findFirst({
                where: { name: getPremiumInputDto.subscriptionName },
            })

            const paymentSystem = await this.prisma.paymentSystem.findFirst({
                where: { name: 'PayPal' },
            })

            if (!product || !paymentSystem) {
                this.logger.error('Product or PaymentSystem not found')
                return null
            }

            // Создание заказа в базе данных
            const order = await this.createOrderInDB(
                getPremiumInputDto.subscriptionName,
                userId,
                product.id,
                paymentSystem.id
            )

            if (!order) {
                this.logger.error('Failed to create order in DB')
                return null
            }

            // Создание заказа в PayPal
            const request = new paypal.orders.OrdersCreateRequest()
            request.requestBody({
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        amount: {
                            currency_code: product.currency,
                            value: (product.amount / 100).toFixed(2), // Преобразуем цену в доллары
                        },
                    },
                ],
            })

            const response = await this.paypalClient.execute(request)

            // Обновление clientReferenceId в базе данных
            await this.prisma.order.update({
                where: { id: order.id },
                data: {
                    clientReferenceId: response.result.id,
                },
            })

            const approveLink = response.result.links?.find(
                (link) => link.rel === 'approve'
            )?.href

            if (approveLink) {
                return { id: response.result.id, url: approveLink }
            }

            this.logger.error('No approve link found in PayPal response')
            return null
        } catch (error) {
            this.logger.error('Error creating PayPal order', error)
            return null
        }
    }

    private async createOrderInDB(
        subscriptionType: string,
        userId: number,
        productId: number,
        paymentSystemId: number
    ) {
        return this.prisma.order.create({
            data: {
                subscriptionType,
                userId,
                productId,
                paymentSystemId,
                quantity: 1,
                status: 'created',
                clientReferenceId: '', // Заполняется позже
            },
        })
    }
}
