import Configuration from '../../../../../../../libs/config/configuration'
import { DynamicModule, Module } from '@nestjs/common'
import { StripeController } from './stripe.controller'
import { ConfigModule } from '@nestjs/config'
import { StripeService } from './stripe.service'
import { StripeRepository } from './stripe.repository'
import { PrismaService } from '../../../../../../../prisma/prisma.service'

@Module({})
export class StripeModule {
    static forRootAsync(): DynamicModule {
        return {
            module: StripeModule,
            controllers: [StripeController],
            imports: [ConfigModule.forRoot()],
            providers: [
                PrismaService,
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
                {
                    provide: 'STRIPE_SIGNING_SECRET',
                    useFactory: () => {
                        const { STRIPE_SIGNING_SECRET } =
                            Configuration.getConfiguration()
                        return STRIPE_SIGNING_SECRET
                    },
                },
            ],
            exports: [StripeService],
        }
    }
}
