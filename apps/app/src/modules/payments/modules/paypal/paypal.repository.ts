// import { Injectable, Logger } from '@nestjs/common'
// import { PrismaService } from '../../../../../../../prisma/prisma.service'
// import { Order, Payment, Product } from '@prisma/client'
// import { OrderStatusEnum } from '../../api/enum/orderStatusEnum'
//
// @Injectable()
// export class PayPalRepository {
//     private readonly logger = new Logger(PayPalRepository.name)
//
//     constructor(private readonly prisma: PrismaService) {}
//
//     async createOrder(
//         subscriptionType: string,
//         orderId: string,
//         paymentSystemName: string,
//         userId: number,
//         productId: number,
//         quantity: number
//     ): Promise<Order | null> {
//         const status = OrderStatusEnum.created
//         const paymentSystem = await this.prisma.paymentSystem.findFirst({
//             where: { name: paymentSystemName },
//         })
//
//         try {
//             const order = await this.prisma.order.create({
//                 data: {
//                     subscriptionType,
//                     clientReferenceId: orderId,
//                     paymentSystemId: paymentSystem.id,
//                     userId,
//                     productId,
//                     quantity,
//                     status,
//                 },
//             })
//             return order
//         } catch (error) {
//             this.logger.error('Error creating PayPal order', error)
//             return null
//         }
//     }
//
//     async getProduct(subscriptionName: string): Promise<Product> {
//         return this.prisma.product.findFirst({
//             where: { name: subscriptionName },
//         })
//     }
//
//     async getOrder(orderId: string): Promise<Order | null> {
//         return this.prisma.order.findFirst({
//             where: { clientReferenceId: orderId },
//             include: { product: true },
//         })
//     }
//
//     async updateOrderStatus(orderId: string, status: string): Promise<void> {
//         await this.prisma.order.updateMany({
//             where: { clientReferenceId: orderId },
//             data: { status },
//         })
//     }
//
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
//                         dateOfPayment.getTime() + 30 * 24 * 60 * 60 * 1000
//                     ), // Example: 30 days later
//                     price: order.product.amount,
//                 },
//             })
//         } catch (error) {
//             this.logger.error('Error creating payment', error)
//             return null
//         }
//     }
// }
