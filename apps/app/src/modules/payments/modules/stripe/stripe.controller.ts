import {
    Controller,
    Get,
    Logger,
    Post,
    RawBodyRequest,
    Req,
} from '@nestjs/common'
import { StripeService } from './stripe.service'
import { Request } from 'express'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {
    private readonly logger = new Logger(StripeController.name)

    constructor(private readonly stripeService: StripeService) {}

    @Get('success')
    async successEndpoint() {
        return 'All is successfully'
    }

    @Get('cancel')
    async cancelEndpoint() {
        return 'All is not successfully'
    }

    @Post('hook')
    async stripeHook(@Req() res: RawBodyRequest<Request>) {
        const signature = res.headers['stripe-signature']

        await this.stripeService.workWithWebhook(res.rawBody, signature)

        console.log('data', JSON.stringify(res.rawBody))
    }
}
