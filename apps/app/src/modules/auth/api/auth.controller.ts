import { CommandBus } from '@nestjs/cqrs'
import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Headers,
    HttpCode,
    HttpStatus,
    Injectable,
    Ip,
    Post,
    Query,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common'
import { CreateUserDto } from './dto/CreateUserDto'
import { Response } from 'express'
import { CreateUserByRegistrationCommand } from '../application/use-cases/CreateUserByRegistration'
import { AuthService } from '../application/auth.service'
import { LocalAuthGuard } from '../guards/local-auth.guard'
import { AddDeviceInfoToDBCommand } from '../application/use-cases/AddDeviceInfoToDB'
import { UserId } from './decorators/user.decorator'
import { ConfirmEmailCommand } from '../application/use-cases/ConfirmEmail'
import { ChangeUserConfirmationCodeCommand } from '../application/use-cases/ChangeUserConfirmationCode'
import { AddRecoveryCodeAndEmailCommand } from '../application/use-cases/AddRecoveryCodeAndEmail'
import { ConfirmAndChangePasswordCommand } from '../application/use-cases/ConfirmAndChangePassword'
import { Cookies } from './decorators/auth.decorator'
import { LogoutUserCommand } from '../application/use-cases/LogoutUser'
import { RefreshTokenByRefreshCommand } from '../application/use-cases/RefreshTokenByRefresh'
import { emailDto } from '../types/emailDto'
import { AuthGuard } from '@nestjs/passport'
import { UserRepository } from '../../user/infrastructure/repositories/user.repository'
import { ResponseAccessTokenViewDTO } from './dto/ResponseAccessTokenViewDTO'
import axios from 'axios'
import { UserQueryRepository } from '../../user/infrastructure/repositories/user.query.repository'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { RegistrationEndpoint } from '../../../swagger/auth/registration'
import { LoginEndpoint } from '../../../swagger/auth/login'
import { RefreshTokenEndpoint } from '../../../swagger/auth/refreshTokenEndpoint'
import { LogoutEndpoint } from '../../../swagger/auth/logoutEndpoint'
import { RegistrationEmailResendingEndpoint } from '../../../swagger/auth/registrationEmailResendingEndpoint'
import { PasswordRecoveryEndpoint } from '../../../swagger/auth/passwordRecoveryEndpoint'
import { EmailService } from '../../email/email.service'
import {
    mappingBadRequest,
    mappingErrorStatus,
    ResultObject,
} from '../../../helpers/helpersType'
import Configuration from '../../../config/configuration'
import { Me } from '../../../swagger/auth/me'
import { AuthInputModel } from './dto/AuthInputModel'
import { SwaggerPostRegistrationConfirmationEndpoint } from '../../../swagger/Internal/swaggerPostRegistrationConfirmationEndpoint'
import { SwaggerGetRegistrationConfirmationEndpoint } from '../../../swagger/Internal/swaggerGetRegistrationConfirmationEndpoint'
import { SwaggerPostGithubEndpoint } from '../../../swagger/Internal/swaggerPostGithubEndpoint'
import { githubEndpoint } from '../../../swagger/auth/githubEndpoint'
import { SwaggerPostGoogleEndpoint } from '../../../swagger/Internal/swaggerPostGoogleEndpoint'
import { GoogleEndpoint } from '../../../swagger/auth/googleEndpoint'

@Injectable()
@Controller('auth')
export class AuthController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly authService: AuthService,
        private readonly emailService: EmailService,
        private readonly userRepository: UserRepository,
        private readonly userQueryRepository: UserQueryRepository
    ) {}

    @Post('registration')
    @RegistrationEndpoint()
    @HttpCode(HttpStatus.NO_CONTENT)
    async registrationUser(@Body() createUserDto: CreateUserDto) {
        const newUser: ResultObject<string> = await this.commandBus.execute(
            new CreateUserByRegistrationCommand(createUserDto)
        )
        if (newUser.data === null) return mappingErrorStatus(newUser)
        return await this.userQueryRepository.findUserById(Number(newUser.data))
    }

    @Post('/login')
    @UseGuards(LocalAuthGuard)
    @LoginEndpoint()
    @HttpCode(200)
    async loginUser(
        @Res({ passthrough: true }) res: Response,
        @Headers('User-Agent') userAgent: string | 'unknow',
        @Body() authInputModel: AuthInputModel,
        @Ip() ip: string,
        @UserId() userId: number
    ) {
        userAgent = userAgent ?? 'unknow'
        const tokensInfo = await this.commandBus.execute(
            new AddDeviceInfoToDBCommand(userId, userAgent, ip)
        )
        if (tokensInfo.data === null) return mappingErrorStatus(tokensInfo)

        res.cookie('refreshToken', tokensInfo.data.refreshToken, {
            httpOnly: true,
            secure: true,
        }).header('accessToken', tokensInfo.data.accessToken)
        return new ResponseAccessTokenViewDTO({
            accessToken: tokensInfo.data.accessToken,
        })
    }

    @Post('/refresh-token')
    @RefreshTokenEndpoint()
    async refreshToken(
        @Res({ passthrough: true }) res: Response,
        @Headers('User-Agent') userAgent: string | 'unknow',
        @Ip() ip: string,
        @Cookies('refreshToken') refreshToken: string
    ) {
        if (!refreshToken) throw new UnauthorizedException()

        const tokens = await this.commandBus.execute(
            new RefreshTokenByRefreshCommand(refreshToken, userAgent, ip)
        )
        if (tokens.data === null) mappingErrorStatus(tokens)
        res.cookie('refreshToken', tokens.data.refreshToken, {
            httpOnly: true,
            secure: true,
        })
            .header('accessToken', tokens.data.accessToken)
            .status(200)
            .send({ accessToken: tokens.data.accessToken })
    }

    @Post('/logout')
    @LogoutEndpoint()
    @HttpCode(204)
    async logoutUser(
        @Res({ passthrough: true }) res: Response,
        @Cookies('refreshToken') refreshToken: string
    ) {
        const result = await this.commandBus.execute(
            new LogoutUserCommand(refreshToken)
        )
        if (result.data == null) mappingErrorStatus(result)

        res.clearCookie('refreshToken')
    }

    @Post('/registration-confirmation')
    @SwaggerPostRegistrationConfirmationEndpoint()
    @HttpCode(204)
    async registrationConfirmation(@Query('code') code: string) {
        const result = await this.commandBus.execute(
            new ConfirmEmailCommand(code)
        )
        if (!result.data) return mappingErrorStatus(result)
        return {
            data: 'ok',
            message: 'Your email has been confirmed',
            link: 'https://incubatogram.org/auth/sign-up/congratulations',
        }
    }

    @Get('/registration-confirmation')
    @SwaggerGetRegistrationConfirmationEndpoint()
    async getRegistrationConfirmation(
        @Query('code') code: string,
        @Res() res: Response
    ) {
        try {
            const result = await axios.post(
                `https://app.incubatogram.org/api/v1/auth/registration-confirmation?code=${code}`
            )
            if (result.status === 204 || (result.data && result.data !== '')) {
                res.send({
                    message: 'Your email has been confirmed',
                    link: 'https://incubatogram.org/auth/sign-up/congratulations',
                })
            } else {
                res.status(500).send('Error confirming registration')
            }
        } catch (error) {
            console.error('Error confirming registration:', error)
            res.status(500).send('Error confirming registration')
        }
    }

    @Post('/registration-email-resending')
    @RegistrationEmailResendingEndpoint()
    @HttpCode(204)
    async registrationEmailResending(@Body() { email }: emailDto) {
        const newUserConfirmationCode = await this.commandBus.execute(
            new ChangeUserConfirmationCodeCommand(email)
        )
        if (newUserConfirmationCode.data === null)
            return mappingErrorStatus(newUserConfirmationCode)

        try {
            await this.emailService.sendConfirmationEmail(
                newUserConfirmationCode.data,
                email
            )
        } catch (e) {
            mappingBadRequest('some error', 'code')
        }
        return true
    }

    @Post('/password-recovery')
    @PasswordRecoveryEndpoint()
    @HttpCode(204)
    async passwordRecovery(@Body() { email, recaptchaValue }: emailDto) {
        const recoveryCode = await this.commandBus.execute(
            new AddRecoveryCodeAndEmailCommand(email, recaptchaValue)
        )
        if (recoveryCode.data === null) return mappingErrorStatus(recoveryCode)
        try {
            await this.emailService.sendRecoveryPasswordEmail(
                recoveryCode.data,
                email
            )
            return true
        } catch (e) {
            throw new BadRequestException(e.message)
        }
    }

    @Get('/new-password')
    async getNewPasswordGetRequest(
        @Query('code') code: string,
        @Res() res: Response
    ) {
        try {
            const result = await axios.post(
                `https://app.incubatogram.org/api/v1/auth/new-password?code=${code}`
            )

            if (result.status === 204 || (result.data && result.data !== '')) {
                res.send({
                    message: 'Your password successfully changed',
                })
            } else {
                res.status(500).send('Error change password')
            }
        } catch (error) {
            console.error('Error confirming registration:', error)
            res.status(500).send('Error change password')
        }
    }

    @Post('/new-password')
    @HttpCode(204)
    async getNewPassword(
        @Query() { code }: { code: string },
        @Body() { newPassword }: { newPassword: string }
        // @Body() { newPassword, newRecoveryCode }: newPasswordWithRecoveryCodeDto
    ) {
        const result = await this.commandBus.execute(
            new ConfirmAndChangePasswordCommand(code, newPassword)
        )
        if (result.data === null) return mappingErrorStatus(result)
        return true
    }

    @Get('github')
    @githubEndpoint()
    @UseGuards(AuthGuard('github'))
    async githubAuth() {}

    @Get('github-success')
    @SwaggerPostGithubEndpoint()
    @UseGuards(AuthGuard('github'))
    async githubAuthCallback(
        @Req() req,
        @Res({ passthrough: true }) res: Response,
        @Headers('User-Agent') userAgent: string | 'unknow',
        @Ip() ip: string
    ) {
        userAgent = userAgent ?? 'unknow'
        const tokensInfo = await this.commandBus.execute(
            new AddDeviceInfoToDBCommand(req.user.id, userAgent, ip)
        )
        if (tokensInfo.data === null) return mappingErrorStatus(tokensInfo)
        const currentUser = await this.userRepository.findUserById(req.user.id)

        res.cookie('refreshToken', tokensInfo.data.refreshToken, {
            httpOnly: true,
            secure: true,
        }).header('accessToken', tokensInfo.data.accessToken)

        //передать инфу в access tokena, credencial отправить тоже  query ( url)  //res.redirect('https://incubatogram.org/auth/sign-up/congratulations')

        res.redirect(
            Configuration.getConfiguration().FRONT_URL +
                `auth/github-success?id=${currentUser.id}&userName=${currentUser.userName}&avatar=${currentUser.avatarId}&accessToken=${tokensInfo.data.accessToken}`
        )
        return { accessToken: tokensInfo.data.accessToken }
    }

    @Get('google')
    @GoogleEndpoint()
    @UseGuards(AuthGuard('google'))
    async googleAuth() {}

    @Get('google-success')
    @SwaggerPostGoogleEndpoint()
    @UseGuards(AuthGuard('google'))
    async googleAuthCallback(
        @Req() req,
        @Res({ passthrough: true }) res: Response,
        @Headers('User-Agent') userAgent: string | 'unknow',
        @Ip() ip: string
    ) {
        userAgent = userAgent ?? 'unknow'
        const tokensInfo = await this.commandBus.execute(
            new AddDeviceInfoToDBCommand(req.user.id, userAgent, ip)
        )
        if (tokensInfo.data === null) return mappingErrorStatus(tokensInfo)

        const currentUser = await this.userRepository.findUserById(req.user.id)

        res.cookie('refreshToken', tokensInfo.data.refreshToken, {
            httpOnly: true,
            secure: true,
        }).header('accessToken', tokensInfo.data.accessToken)
        res.redirect(
            Configuration.getConfiguration().FRONT_URL +
                `auth/google-success?id=${currentUser.id}&userName=${currentUser.userName}&avatar=${currentUser.avatarId}&accessToken=${tokensInfo.data.accessToken}`
        )
        return { accessToken: tokensInfo.data.accessToken }
    }

    @Get('me')
    @Me()
    @UseGuards(JwtAuthGuard)
    async me(
        @UserId()
        userId: number
    ) {
        return await this.userQueryRepository.findUserById(userId)
    }
}
