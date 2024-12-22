import { Module } from '@nestjs/common'
import { AuthService } from './application/auth.service'
import { ConfigService } from '@nestjs/config'
import { CreateUserByRegistration } from './application/use-cases/CreateUserByRegistration'
import { CqrsModule } from '@nestjs/cqrs'
import { AddDeviceInfoToDB } from './application/use-cases/AddDeviceInfoToDB'
import { CheckCredential } from './application/use-cases/CheckCredential'
import { CreateJWT } from './jwt/application/use-cases/CreateJWT'
import { CreateRefreshJWT } from './jwt/application/use-cases/CreateRefreshJWT'
import { GetTokenInfoByRefreshToken } from './jwt/application/use-cases/GetTokenInfoByRefreshToken'
import { GetUserIdByAccessToken } from './jwt/application/use-cases/GetUserIdByAccessToken'
import { GetUserIdByRefreshToken } from './jwt/application/use-cases/GetUserIdByRefreshToken'
import { AuthRepository } from './infrastructure/repositories/auth.repository'
import { LocalStrategy } from '../../../libs/strategies/local.strategy'
import { LocalAuthGuard } from '../../../libs/guards/local-auth.guard'
import { JwtAuthGuard } from '../../../libs/guards/jwt-auth.guard'
import { BasicStrategy } from '../../../libs/strategies/basic.strategy'
import { BasicAuthGuard } from '../../../libs/guards/basic-auth.guard'
import { LogoutUser } from './application/use-cases/LogoutUser'
import { ChangePasswordRecoveryCode } from './application/use-cases/ChangePasswordRecoveryCode'
import { ConfirmAndChangePassword } from './application/use-cases/ConfirmAndChangePassword'
import { ConfirmEmail } from './application/use-cases/ConfirmEmail'
import { RefreshTokenByRefresh } from './application/use-cases/RefreshTokenByRefresh'
import { JwtStrategy } from '../../../libs/strategies/jwt.strategy'
import { GitHubStrategy } from '../../../libs/strategies/github.strategy'
import { GoogleStrategy } from '../../../libs/strategies/google.strategy'
import { ChangeUserConfirmationCode } from './application/use-cases/ChangeUserConfirmationCode'
import { GithubService } from './application/githubService'
import { UserModule } from '../../app/src/modules/user/user.module'
import { DeviceController } from '../../app/src/modules/devices/device.controller'
import { UserQueryRepository } from '../../app/src/modules/user/infrastructure/repositories/user.query.repository'
import { RecaptchaAdapter } from '../../../libs/helpers/types/helpersType'
import { PrismaService } from '../../../prisma/prisma.service'
import { UsersService } from '../../app/src/modules/user/application/user.service'
import { DeleteOtherUserDevice } from '../../app/src/modules/devices/application/use-cases/DeleteOtherUserDevice'
import { DeleteUserDeviceById } from '../../app/src/modules/devices/application/use-cases/DeleteUserDeviceById'
import { DeviceRepository } from '../../app/src/modules/devices/device.repository'
import { DeviceQueryRepositorySql } from '../../app/src/modules/devices/deviceQuery.repository.sql'
import { UserRepository } from '../../app/src/modules/user/infrastructure/repositories/user.repository'
import { AuthController } from './api/auth.controller'
import { ValidatePasswordRecoveryCode } from './application/use-cases/ValidPasswordRecoveryCode'
import { IRecoveryCodesRepository } from '../../../libs/modules/email/infrastructure/interfaces/recoveryCodes.repository.interface'
import { RecoveryCodesRepository } from '../../../libs/modules/email/infrastructure/repositories/recoveryCodes.repository'
import { EmailService } from '../../../libs/modules/email/email.service'
import Configuration from '../../../libs/config/configuration'
import { ClientProxyFactory } from '@nestjs/microservices'
import { AddDefaultProfile } from './application/use-cases/AddDefaultProfile'

const repositories = [
    { provide: IRecoveryCodesRepository, useClass: RecoveryCodesRepository },
]

const useCases = [
    ChangeUserConfirmationCode,
    ValidatePasswordRecoveryCode,
    AddDefaultProfile,
]

@Module({
    imports: [CqrsModule, UserModule],
    controllers: [AuthController, DeviceController],
    providers: [
        AuthService,
        ConfigService,
        AuthRepository,
        CreateUserByRegistration,
        AddDeviceInfoToDB,
        ChangePasswordRecoveryCode,
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
        GithubService,
        ...repositories,
        ...useCases,
        {
            provide: 'AUTH_SERVICE',
            useFactory: () => {
                const { AUTH_SERVICE } = Configuration.getConfiguration()
                return ClientProxyFactory.create(AUTH_SERVICE)
            },
        },
    ],
    exports: [PrismaService, ...repositories],
})
export class AuthModule {}
