import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import Configuration from './config/configuration'
import { PrismaService } from '../../../prisma/prisma.service'
import { AuthModule } from './auth/auth.module'
import { AuthController } from './auth/auth.controller'
import { CqrsModule } from '@nestjs/cqrs'
import { AuthService } from './auth/auth.service'

const configModule = ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
    load: [Configuration.getConfiguration],
})

@Module({
    imports: [configModule, AuthModule, CqrsModule],
    controllers: [AppController, AuthController],
    providers: [AppService, ConfigService, PrismaService, AuthService],
})
export class AppModule {}
