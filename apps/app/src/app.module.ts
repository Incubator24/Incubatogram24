import { Module, ValidationPipe } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import Configuration from './config/configuration'
import { PrismaService } from '../../../prisma/prisma.service'
import { CqrsModule } from '@nestjs/cqrs'
import { JwtModule } from '@nestjs/jwt'
import { APP_PIPE } from '@nestjs/core'
import { RemoveAllModule } from './modules/testing.removeAll/removeAll.module'
import { AuthService } from './modules/auth/application/auth.service'
import { AuthModule } from './modules/auth/auth.module'
import { UserModule } from './modules/user/user.module'
import { CheckCredential } from './modules/auth/application/use-cases/CheckCredential'
import { UsersService } from './modules/user/application/user.service'
import { UserRepository } from './modules/user/infrastructure/repositories/user.repository'
import { AuthRepository } from './modules/auth/infrastructure/repositories/auth.repository'
import { PostModule } from './modules/post/post.module'

const configModule = ConfigModule.forRoot({
    isGlobal: true,
    envFilePath:
        process.env.NODE_ENV === 'development' ? '.env.development' : '.env',
    load: [Configuration.getConfiguration],
})

@Module({
    imports: [
        configModule,
        CqrsModule,
        AuthModule,
        UserModule,
        PostModule,
        JwtModule,
        RemoveAllModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        ConfigService,
        PrismaService,
        AuthService,
        CheckCredential,
        UsersService,
        UserRepository,
        {
            provide: APP_PIPE,
            useClass: ValidationPipe,
        },
        AuthRepository,
    ],
    exports: [PrismaService],
})
export class AppModule {}
