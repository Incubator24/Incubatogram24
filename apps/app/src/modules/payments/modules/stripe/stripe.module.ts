import Configuration from '../../../../../../../libs/config/configuration'
import { DynamicModule, Module } from '@nestjs/common'
import { StripeController } from './stripe.controller'
import { ConfigModule } from '@nestjs/config'
import { StripeService } from './stripe.service'
import { StripeRepository } from './stripe.repository'

@Module({})
export class StripeModule {
    static forRootAsync(): DynamicModule {
        return {
            module: StripeModule,
            controllers: [StripeController],
            imports: [ConfigModule.forRoot()],
            providers: [
                StripeService,
                StripeRepository,
                {
                    provide: 'STRIPE_API_KEY',
                    useFactory: () => {
                        const { STRIPE_API_KEY } =
                            Configuration.getConfiguration()
                        return STRIPE_API_KEY
                    },
                },
            ],
            exports: [StripeService],
        }
    }
}
