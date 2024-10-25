import { Controller, Injectable } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { AuthService } from '../application/auth.service'
import { EmailService } from '../../../app/src/modules/email/email.service'
import { UserRepository } from '../../../app/src/modules/user/infrastructure/repositories/user.repository'
import { UserQueryRepository } from '../../../app/src/modules/user/infrastructure/repositories/user.query.repository'
import { GithubService } from '../application/githubService'
import { CreateUserDto } from './dto/CreateUserDto'
import { ResultObject } from '../../../../libs/helpers/types/helpersType'
import { CreateUserByRegistrationCommand } from '../application/use-cases/CreateUserByRegistration'
import { AuthInputModel } from './dto/AuthInputModel'
import { AddDeviceInfoToDBCommand } from '../application/use-cases/AddDeviceInfoToDB'
import { RefreshTokenByRefreshCommand } from '../application/use-cases/RefreshTokenByRefresh'
import { LogoutUserCommand } from '../application/use-cases/LogoutUser'
import { ConfirmEmailCommand } from '../application/use-cases/ConfirmEmail'
import { ChangeUserConfirmationCodeCommand } from '../application/use-cases/ChangeUserConfirmationCode'
import { ChangePasswordRecoveryCodeCommand } from '../application/use-cases/ChangePasswordRecoveryCode'
import { ConfirmAndChangePasswordCommand } from '../application/use-cases/ConfirmAndChangePassword'
import { MessagePattern } from '@nestjs/microservices'
import { tokensDto } from '../../../../libs/types/TokensDto'

@Injectable()
@Controller('auth')
export class AuthController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly authService: AuthService,
        private readonly emailService: EmailService,
        private readonly userRepository: UserRepository,
        private readonly userQueryRepository: UserQueryRepository,
        private readonly githubService: GithubService
    ) {}

    @MessagePattern('registration')
    async registrationUser(
        createUserDto: CreateUserDto
    ): Promise<ResultObject<string>> {
        const newUser: ResultObject<string> = await this.commandBus.execute(
            new CreateUserByRegistrationCommand(createUserDto)
        )
        return newUser
    }

    @MessagePattern('login')
    async loginUser(data: {
        userAgent: string
        authInputModel: AuthInputModel
        ip: string
        userId: number
    }) {
        const { userAgent, authInputModel, ip, userId } = data
        const tokensInfo = await this.commandBus.execute(
            new AddDeviceInfoToDBCommand(userId, userAgent, ip)
        )
        return tokensInfo
    }

    @MessagePattern('refresh-token')
    async refreshToken(data: {
        userAgent: string
        ip: string
        refreshToken: string
    }): Promise<ResultObject<tokensDto>> {
        const { userAgent, ip, refreshToken } = data
        const tokens = await this.commandBus.execute(
            new RefreshTokenByRefreshCommand(refreshToken, userAgent, ip)
        )
        return tokens
    }

    @MessagePattern('logout')
    async logoutUser(data: { refreshToken: string }) {
        const { refreshToken } = data
        const result: ResultObject<string> = await this.commandBus.execute(
            new LogoutUserCommand(refreshToken)
        )
        return result
    }
    //
    // @Post('/registration-confirmation')
    // @SwaggerPostRegistrationConfirmationEndpoint()
    // @HttpCode(204)
    // async registrationConfirmation(@Body() code: string, @Res() res: Response) {
    //     console.log('code = ', code)
    //     const result = await this.commandBus.execute(
    //         new ConfirmEmailCommand(code)
    //     )
    //     console.log('result2 = ', result)
    //     if (!result.data) return mappingErrorStatus(result)
    //     return res.redirect(
    //         'https://incubatogram.org/auth/sign-up/congratulations'
    //     )
    // }

    @MessagePattern('registration-confirmation')
    async getRegistrationConfirmation(data: {
        code: string
    }): Promise<ResultObject<string>> {
        const { code } = data
        const result = await this.commandBus.execute(
            new ConfirmEmailCommand(code)
        )
        return result
    }

    @MessagePattern('registration-email-resending')
    async registrationEmailResending(data: { email: string }) {
        const { email } = data
        const newUserConfirmationCode: ResultObject<string> =
            await this.commandBus.execute(
                new ChangeUserConfirmationCodeCommand(email)
            )
        return newUserConfirmationCode
    }

    @MessagePattern('password-recovery')
    async passwordRecovery(data: { email: string; recaptchaValue: string }) {
        const { email, recaptchaValue } = data
        const recoveryCode: ResultObject<string> =
            await this.commandBus.execute(
                new ChangePasswordRecoveryCodeCommand(email, recaptchaValue)
            )
        return recoveryCode
    }

    @MessagePattern('new-password')
    async getNewPassword(data: {
        code: string
        newPassword: string
    }): Promise<ResultObject<string>> {
        const { code, newPassword } = data
        const result = await this.commandBus.execute(
            new ConfirmAndChangePasswordCommand(code, newPassword)
        )
        return result
    }

    @MessagePattern('github')
    async github(data: {
        code: string
        userAgent: string
        ip: string
    }): Promise<ResultObject<tokensDto>> {
        const { code, ip, userAgent } = data
        const accessToken = await this.githubService.validate(code)
        console.log('accessToken = ', accessToken)
        const user = await this.githubService.getGithubUserByToken(accessToken)
        console.log('user = ', user)
        await this.authService.validateOAuthLogin(user, 'github')

        // та же логика что и на google

        const tokensInfo: ResultObject<tokensDto> =
            await this.commandBus.execute(
                new AddDeviceInfoToDBCommand(user.id, userAgent, ip)
            )

        if (tokensInfo.data === null) return null

        return tokensInfo
    }

    @MessagePattern('google-success')
    async googleAuthCallback(data: {
        userId: number
        userAgent: string | 'unknow'
        ip: string
    }): Promise<ResultObject<tokensDto>> {
        let { userId, userAgent, ip } = data
        userAgent = userAgent ?? 'unknow'
        const tokensInfo = await this.commandBus.execute(
            new AddDeviceInfoToDBCommand(userId, userAgent, ip)
        )
        return tokensInfo
    }
}
