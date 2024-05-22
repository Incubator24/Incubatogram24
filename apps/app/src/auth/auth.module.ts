import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthController } from './auth.controller'
import Configuration from '../config/congiguration'
import { PrismaService } from '../../../../prisma/prisma.service'
import { CreateUserByRegistration } from './application/use-cases/CreateUserByRegistration'
import { UserRepository } from '../user/user.repository'
import { CommandBus, CqrsModule } from '@nestjs/cqrs'

const configModule = ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
    load: [Configuration.getConfiguration],
})

@Module({
    imports: [configModule, CqrsModule],
    controllers: [AuthController],
    providers: [
        AuthService,
        ConfigService,
        PrismaService,
        UserRepository,
        CreateUserByRegistration,
        CommandBus,
    ],
})
export class AuthModule {}
