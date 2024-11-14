import {
    Body,
    Controller,
    Get,
    Logger,
    Post,
    Res,
    UseGuards,
} from '@nestjs/common'
import { SwaggerCreateOrder } from '../../../../../libs/swagger/payments/swaggerCreateOrder'
import { GetPremiumInputDto } from './api/dto/input/GetPremiumInputDto'
import { UserId } from '../../../../auth/src/api/decorators/user.decorator'
import { JwtAuthGuard } from '../../../../../libs/guards/jwt-auth.guard'
import { PaymentsService } from './payments.service'
import { Response } from 'express'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
    private readonly logger = new Logger(PaymentsController.name)

    constructor(private readonly paymentsService: PaymentsService) {} // private readonly stripeService: StripeService

    @Post('premium')
    @SwaggerCreateOrder()
    @UseGuards(JwtAuthGuard)
    async getPremium(
        @Body() getPremiumInputDto: GetPremiumInputDto,
        @UserId() userId: number,
        @Res({ passthrough: true }) res: Response
    ) {
        const { url } = await this.paymentsService.getPremium(
            getPremiumInputDto,
            userId
        )
        if (url) {
            res.redirect(url)
            this.logger.log('method get premium returns url: ', url)
        }
    }

    @Get('success')
    async successEndpoint() {
        return 'All is successfully'
    }

    @Get('cancel')
    async cancelEndpoint() {
        return 'All is not successfully'
    }

    // @Post('hook')
    // async stripeHook(@Req() res: RawBodyRequest<Request>) {
    //     const signature = res.headers['stripe-signature']
    //
    //     await this.stripeService.workWithWebhook(res.rawBody, signature)
    //
    //     console.log('data', JSON.stringify(res.rawBody))
    // }
}
