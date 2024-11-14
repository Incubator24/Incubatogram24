import { Injectable, Logger } from '@nestjs/common'
import { StripeService } from './stripe.service'

@Injectable()
export class StripeRepository {
    private readonly logger = new Logger(StripeService.name)

    constructor() {}

    createOrder() {
        this.logger.log('create order from stripe repository')
    }
}
