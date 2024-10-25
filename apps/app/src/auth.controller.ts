import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Headers,
    HttpCode,
    HttpStatus,
    Inject,
    Injectable,
    Ip,
    NotFoundException,
    Post,
    Query,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common'
import { Response } from 'express'
import axios from 'axios'
import { AuthGuard } from '@nestjs/passport'
import { EmailService } from './modules/email/email.service'
import { UserRepository } from './modules/user/infrastructure/repositories/user.repository'
import { UserQueryRepository } from './modules/user/infrastructure/repositories/user.query.repository'
import { GithubService } from '../../auth/src/application/githubService'
import { RegistrationEndpoint } from '../../../libs/swagger/auth/registration'
import { CreateUserDto } from '../../auth/src/api/dto/CreateUserDto'
import {
    mappingBadRequest,
    mappingErrorStatus,
    ResultObject,
} from '../../../libs/helpers/types/helpersType'
import { LocalAuthGuard } from '../../../libs/guards/local-auth.guard'
import { LoginEndpoint } from '../../../libs/swagger/auth/login'
import { AuthInputModel } from '../../auth/src/api/dto/AuthInputModel'
import { UserId } from '../../auth/src/api/decorators/user.decorator'
import { ResponseAccessTokenViewDTO } from '../../auth/src/api/dto/ResponseAccessTokenViewDTO'
import { RefreshTokenEndpoint } from '../../../libs/swagger/auth/refreshTokenEndpoint'
import { Cookies } from 'apps/auth/src/api/decorators/auth.decorator'
import { LogoutEndpoint } from '../../../libs/swagger/auth/logoutEndpoint'
import { SwaggerGetRegistrationConfirmationEndpoint } from '../../../libs/swagger/Internal/swaggerGetNewPasswordEndpoint'
import { RegistrationEmailResendingEndpoint } from '../../../libs/swagger/auth/registrationEmailResendingEndpoint'
import { emailDto } from '../../auth/src/types/emailDto'
import { PasswordRecoveryEndpoint } from '../../../libs/swagger/auth/passwordRecoveryEndpoint'
import { SwaggerPostRegistrationConfirmationEndpoint } from '../../../libs/swagger/Internal/swaggerPostNewPasswordEndpoint'
import Configuration from '../../../libs/config/configuration'
import { GoogleEndpoint } from '../../../libs/swagger/auth/googleEndpoint'
import { SwaggerPostGoogleEndpoint } from '../../../libs/swagger/Internal/swaggerPostGoogleEndpoint'
import { Me } from '../../../libs/swagger/auth/me'
import { JwtAuthGuard } from '../../../libs/guards/jwt-auth.guard'
import { ClientProxy } from '@nestjs/microservices'
import { firstValueFrom } from 'rxjs'
import { tokensDto } from '../../../libs/types/TokensDto'

@Injectable()
@Controller('auth')
export class AuthController {
    constructor(
        private readonly emailService: EmailService,
        private readonly userRepository: UserRepository,
        private readonly userQueryRepository: UserQueryRepository,
        private readonly githubService: GithubService,
        @Inject('AUTH_SERVICE') private readonly authServiceClient: ClientProxy
    ) {}

    @Post('registration')
    @RegistrationEndpoint()
    @HttpCode(HttpStatus.NO_CONTENT)
    async registrationUser(@Body() createUserDto: CreateUserDto) {
        const newUser: ResultObject<string> = await firstValueFrom(
            this.authServiceClient.send('registration', createUserDto)
        )
        if (newUser.data === null) return mappingErrorStatus(newUser)
        return await this.userQueryRepository.findUserById(Number(newUser.data))
    }

    @Post('login')
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
        console.log('userId = ', userId)
        userAgent = userAgent ?? 'unknow'
        const tokensInfo: ResultObject<{
            accessToken: string
            refreshToken: string
        }> = await firstValueFrom(
            this.authServiceClient.send('login', {
                userAgent,
                authInputModel,
                ip,
                userId,
            })
        )
        if (tokensInfo.data === null) return mappingErrorStatus(tokensInfo)

        res.cookie('refreshToken', tokensInfo.data.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        }).header('accessToken', tokensInfo.data.accessToken)
        return new ResponseAccessTokenViewDTO({
            accessToken: tokensInfo.data.accessToken,
        })
    }

    @Post('refresh-token')
    @RefreshTokenEndpoint()
    async refreshToken(
        @Res({ passthrough: true }) res: Response,
        @Headers('User-Agent') userAgent: string | 'unknow',
        @Ip() ip: string,
        @Cookies('refreshToken') refreshToken: string
    ) {
        if (!refreshToken) throw new UnauthorizedException()

        const tokens: ResultObject<tokensDto> = await firstValueFrom(
            this.authServiceClient.send('refresh-token', {
                userAgent,
                ip,
                refreshToken,
            })
        )
        if (tokens.data === null) mappingErrorStatus(tokens)
        res.cookie('refreshToken', tokens.data.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        })
            .header('accessToken', tokens.data.accessToken)
            .status(200)
            .send({ accessToken: tokens.data.accessToken })
    }

    @Post('logout')
    @LogoutEndpoint()
    @HttpCode(204)
    async logoutUser(
        @Res({ passthrough: true }) res: Response,
        @Cookies('refreshToken') refreshToken: string
    ) {
        const result = await firstValueFrom(
            this.authServiceClient.send('logout', {
                refreshToken,
            })
        )
        if (result.data == null) mappingErrorStatus(result)

        res.clearCookie('refreshToken')
    }

    @Get('registration-confirmation')
    @SwaggerGetRegistrationConfirmationEndpoint()
    async getRegistrationConfirmation(
        @Query('code') code: string,
        @Res() res: Response
    ) {
        const result = await firstValueFrom(
            this.authServiceClient.send('registration-confirmation', { code })
        )
        if (!result.data) return mappingErrorStatus(result)
        return res.redirect(
            'https://incubatogram.org/auth/sign-up/congratulations'
        )
    }

    @Post('registration-email-resending')
    @RegistrationEmailResendingEndpoint()
    @HttpCode(204)
    async registrationEmailResending(@Body() { email }: emailDto) {
        const newUserConfirmationCode = await firstValueFrom(
            this.authServiceClient.send('registration-email-resending', {
                email,
            })
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

    @Post('password-recovery')
    @PasswordRecoveryEndpoint()
    @HttpCode(204)
    async passwordRecovery(@Body() { email, recaptchaValue }: emailDto) {
        const recoveryCode = await firstValueFrom<ResultObject<string>>(
            this.authServiceClient.send('password-recovery', {
                email,
                recaptchaValue,
            })
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

    @Get('new-password')
    @SwaggerGetRegistrationConfirmationEndpoint()
    @HttpCode(HttpStatus.NO_CONTENT)
    async getNewPasswordGetRequest(
        @Query('code') code: string,
        @Res() res: Response
    ) {
        try {
            const result = await axios.post(
                `https://app.incubatogram.org/api/v1/auth/create-new-password?code=${code}`,
                { newPassword: code }
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

    @Post('new-password')
    @SwaggerPostRegistrationConfirmationEndpoint()
    @HttpCode(204)
    async getNewPassword(
        @Query('code') code: string,
        @Body() { newPassword }: { newPassword: string }
    ) {
        const result = await firstValueFrom<ResultObject<string>>(
            this.authServiceClient.send('new-password', {
                code,
                newPassword,
            })
        )
        if (result.data === null) return mappingErrorStatus(result)
        return true
    }

    @Post('github')
    async github(
        @Body() body: { code: string },
        @Headers('User-Agent') userAgent: string | 'unknow',
        @Ip() ip: string,
        @Res({ passthrough: true }) res: Response
    ) {
        const accessToken = await this.githubService.validate(body.code)
        console.log('accessToken = ', accessToken)
        const user = await this.githubService.getGithubUserByToken(accessToken)
        console.log('user = ', user)

        // та же логика что и на google

        const tokensInfo = await firstValueFrom<ResultObject<tokensDto>>(
            this.authServiceClient.send('github', {
                code: body.code,
                userAgent,
                ip,
            })
        )
        console.log('tokensInfo = ', tokensInfo)
        if (tokensInfo.data === null) return mappingErrorStatus(tokensInfo)

        const currentUser = await this.userRepository.findUserById(user.id)
        //

        res.cookie('refreshToken', tokensInfo.data.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        }).header('accessToken', tokensInfo.data.accessToken)
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
        const tokensInfo = await firstValueFrom<ResultObject<tokensDto>>(
            this.authServiceClient.send('', {
                userId: req.user.id,
                userAgent,
                ip,
            })
        )
        if (tokensInfo.data === null) return mappingErrorStatus(tokensInfo)

        const currentUser = await this.userRepository.findUserById(req.user.id)

        res.cookie('refreshToken', tokensInfo.data.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        }).header('accessToken', tokensInfo.data.accessToken)
        res.redirect(
            Configuration.getConfiguration().FRONT_URL +
                `auth/google-success?id=${currentUser.id}&userName=${currentUser.userName}&avatar=${currentUser.avatarId}&accessToken=${tokensInfo.data.accessToken}`
        )
        return { accessToken: tokensInfo.data.accessToken }
        // res.redirect(
        //     `http://localhost:3000?id=${currentUser.id}&userName=${currentUser.userName}&avatar=${currentUser.avatarId}&accessToken=${tokensInfo.data.accessToken}`
        // )
        // return { accessToken: tokensInfo.data.accessToken }
    }

    @Get('me')
    @Me()
    @UseGuards(JwtAuthGuard)
    async me(
        @UserId()
        userId: number
    ) {
        const getProfile = await this.userQueryRepository.getProfile(userId)
        if (getProfile) {
            return getProfile
        } else {
            throw new NotFoundException()
        }
    }
}
