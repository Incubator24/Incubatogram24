import { Module } from '@nestjs/common'
import { AuthService } from './application/auth.service'
import { ConfigService } from '@nestjs/config'
import { AuthController } from './api/auth.controller'
import { CreateUserByRegistration } from './application/use-cases/CreateUserByRegistration'
import { UserRepository } from '../user/infrastructure/repositories/user.repository'
import { CqrsModule } from '@nestjs/cqrs'
import { AddDeviceInfoToDB } from './application/use-cases/AddDeviceInfoToDB'
import { CheckCredential } from './application/use-cases/CheckCredential'
import { CreateJWT } from './jwt/application/use-cases/CreateJWT'
import { CreateRefreshJWT } from './jwt/application/use-cases/CreateRefreshJWT'
import { GetTokenInfoByRefreshToken } from './jwt/application/use-cases/GetTokenInfoByRefreshToken'
import { GetUserIdByAccessToken } from './jwt/application/use-cases/GetUserIdByAccessToken'
import { GetUserIdByRefreshToken } from './jwt/application/use-cases/GetUserIdByRefreshToken'
import { DeleteOtherUserDevice } from '../devices/application/use-cases/DeleteOtherUserDevice'
import { DeleteUserDeviceById } from '../devices/application/use-cases/DeleteUserDeviceById'
import { AuthRepository } from './infrastructure/repositories/auth.repository'
import { DeviceRepository } from '../devices/device.repository'
import { DeviceQueryRepositorySql } from '../devices/deviceQuery.repository.sql'
import { LocalStrategy } from './strategies/local.strategy'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { BasicStrategy } from './strategies/basic.strategy'
import { BasicAuthGuard } from './guards/basic-auth.guard'
import { LogoutUser } from './application/use-cases/LogoutUser'
import { DeviceController } from '../devices/device.controller'
import { AddRecoveryCodeAndEmail } from './application/use-cases/AddRecoveryCodeAndEmail'
import { ConfirmAndChangePassword } from './application/use-cases/ConfirmAndChangePassword'
import { ConfirmEmail } from './application/use-cases/ConfirmEmail'
import { RefreshTokenByRefresh } from './application/use-cases/RefreshTokenByRefresh'
import { JwtStrategy } from './strategies/jwt.strategy'
import { GitHubStrategy } from './strategies/github.strategy'
import { GoogleStrategy } from './strategies/google.strategy'
import { UsersService } from '../user/application/user.service'
import { UserQueryRepository } from '../user/infrastructure/repositories/user.query.repository'
import { RecoveryCodesRepository } from '../email/recoveryCodes.repository'
import { EmailService } from '../email/email.service'
import { RecaptchaAdapter } from '../../helpers/helpersType'
import { PrismaService } from '../../../../../prisma/prisma.service'
import { UserModule } from '../user/user.module'

// const configModule = ConfigModule.forRoot({
//     isGlobal: true,
//     envFilePath: '.env.main.main',
//     load: [Configuration.getConfiguration],
// })

@Module({
    imports: [CqrsModule, UserModule],
    controllers: [AuthController, DeviceController],
    providers: [
        AuthService,
        ConfigService,
        AuthRepository,
        CreateUserByRegistration,
        AddDeviceInfoToDB,
        AddRecoveryCodeAndEmail,
        CheckCredential,
        CreateJWT,
        CreateRefreshJWT,
        GetTokenInfoByRefreshToken,
        GetUserIdByAccessToken,
        GetUserIdByRefreshToken,
        ConfirmAndChangePassword,
        ConfirmEmail,
        DeleteOtherUserDevice,
        RefreshTokenByRefresh,
        DeleteUserDeviceById,
        DeviceRepository,
        DeviceQueryRepositorySql,
        BasicStrategy,
        BasicAuthGuard,
        LogoutUser,
        RecoveryCodesRepository,
        JwtStrategy,
        JwtAuthGuard,
        LocalAuthGuard,
        LocalStrategy,
        GitHubStrategy,
        GoogleStrategy,
        EmailService,
        UserRepository,
        UserQueryRepository,
        DeviceRepository,
        DeviceQueryRepositorySql,
        RecaptchaAdapter,
        PrismaService,
        UsersService,
    ],
    exports: [PrismaService],
})
export class AuthModule {}