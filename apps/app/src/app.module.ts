import { Module, ValidationPipe } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import Configuration from './config/configuration'
import { PrismaService } from '../../../prisma/prisma.service'
import { AuthService } from './auth/auth.service'
import { CheckCredential } from './auth/application/use-cases/CheckCredential'
import { UserRepository } from './user/user.repository'
import { AuthModule } from './auth/auth.module'
import { CqrsModule } from '@nestjs/cqrs'
import { JwtModule } from '@nestjs/jwt'
import { AuthRepository } from './auth/auth.repository'
import { APP_PIPE } from '@nestjs/core'

const configModule = ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
    load: [Configuration.getConfiguration],
})

@Module({
    imports: [configModule, CqrsModule, AuthModule, JwtModule],
    controllers: [AppController],
    providers: [
        AppService,
        ConfigService,
        PrismaService,
        AuthService,
        CheckCredential,
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
