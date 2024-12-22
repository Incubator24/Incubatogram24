import { Module, ValidationPipe } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PrismaService } from '../../../prisma/prisma.service'
import { CqrsModule } from '@nestjs/cqrs'
import { JwtModule } from '@nestjs/jwt'
import { APP_PIPE } from '@nestjs/core'
import { RemoveAllModule } from './modules/testing.removeAll/removeAll.module'
import { UserModule } from './modules/user/user.module'
import { UsersService } from './modules/user/application/user.service'
import { UserRepository } from './modules/user/infrastructure/repositories/user.repository'
import { PostModule } from './modules/post/post.module'
import Configuration from '../../../libs/config/configuration'
import { AuthController } from './auth.controller'
import { EmailService } from '../../../libs/modules/email/email.service'
import { GithubService } from '../../auth/src/application/githubService'
import { ClientProxyFactory } from '@nestjs/microservices'
import { LocalStrategy } from '../../../libs/strategies/local.strategy'
import { JwtStrategy } from '../../../libs/strategies/jwt.strategy'
import { PaymentsModule } from './modules/payments/payments.module'
import { AuthModule } from '../../auth/src/auth.module'

const configModule = ConfigModule.forRoot({
    isGlobal: true,
    envFilePath:
        process.env.NODE_ENV === 'development' ? '.env.development' : '.env',
    load: [Configuration.getConfiguration],
})
//
@Module({
    imports: [
        configModule,
        CqrsModule,
        UserModule,
        PaymentsModule,
        PostModule,
        JwtModule,
        RemoveAllModule,
        AuthModule,
    ],
    controllers: [AppController, AuthController],
    providers: [
        AppService,
        ConfigService,
        PrismaService,
        JwtStrategy,
        LocalStrategy,
        UsersService,
        EmailService,
        GithubService,
        UserRepository,
        {
            provide: APP_PIPE,
            useClass: ValidationPipe,
        },
        {
            provide: 'AUTH_SERVICE',
            useFactory: () => {
                const { AUTH_SERVICE } = Configuration.getConfiguration()
                return ClientProxyFactory.create(AUTH_SERVICE)
            },
        },
    ],
    exports: [PrismaService],
})
export class AppModule {}
