import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthController } from './auth.controller'
import Configuration from '../config/configuration'
import { PrismaService } from '../../../../prisma/prisma.service'
import { CreateUserByRegistration } from './application/use-cases/CreateUserByRegistration'
import { UserRepository } from '../user/user.repository'
import { CommandBus, CqrsModule } from '@nestjs/cqrs'
import { AddDeviceInfoToDB } from './application/use-cases/AddDeviceInfoToDB'
import { CheckCredential } from './application/use-cases/CheckCredential'
import { CreateJWT } from './jwt/application/use-cases/CreateJWT'
import { CreateRefreshJWT } from './jwt/application/use-cases/CreateRefreshJWT'
import { GetTokenInfoByRefreshToken } from './jwt/application/use-cases/GetTokenInfoByRefreshToken'
import { GetUserIdByAccessToken } from './jwt/application/use-cases/GetUserIdByAccessToken'
import { GetUserIdByRefreshToken } from './jwt/application/use-cases/GetUserIdByRefreshToken'
import { DeleteOtherUserDevice } from '../devices/application/use-cases/DeleteOtherUserDevice'
import { DeleteUserDeviceById } from '../devices/application/use-cases/DeleteUserDeviceById'
import { AuthRepository } from './auth.repository.sql'
import { DeviceRepositorySql } from '../devices/device.repository.sql'
import { DeviceQueryRepositorySql } from '../devices/deviceQuery.repository.sql'
import { LocalStrategy } from './strategies/local.strategy'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { JwtStrategy } from './jwt/jwt.strategy'
import { BasicStrategy } from './strategies/basic.strategy'
import { BasicAuthGuard } from './guards/basic-auth.guard'

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
        AuthRepository,
        CreateUserByRegistration,
        AddDeviceInfoToDB,
        CheckCredential,
        CreateJWT,
        CreateRefreshJWT,
        GetTokenInfoByRefreshToken,
        GetUserIdByAccessToken,
        GetUserIdByRefreshToken,
        DeleteOtherUserDevice,
        DeleteUserDeviceById,
        DeviceRepositorySql,
        DeviceQueryRepositorySql,
        LocalAuthGuard,
        LocalStrategy,
        BasicStrategy,
        BasicAuthGuard,
        JwtStrategy,
        JwtAuthGuard,
        CommandBus,
    ],
})
export class AuthModule {}
