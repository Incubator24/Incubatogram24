interface IPaymentAdapter {
    createPayment(payment: any): { data: any; url: string }
}
export class PaymentManager {
    adapters: Partial<Record<PaymentSystemTypes, IPaymentAdapter>> = {}
    constructor(paypalAdapter: any, stripeAdapter: any) {
        this.adapters[PaymentSystemTypes.PayPal] = paypalAdapter
        this.adapters[PaymentSystemTypes.Stripe] = stripeAdapter
    }
    createPayment(payment: any) {
        return this.adapters[payment.paymentSystemType].createPayment(payment)
    }
}
export enum PaymentSystemTypes {
    PayPal = 'paypal',
    Stripe = 'stripe',
}
