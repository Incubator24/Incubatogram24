import { CommandBus } from '@nestjs/cqrs'
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
import { AuthGuard } from '@nestjs/passport'
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
import { ResponseAccessTokenViewDTO } from '../../auth/src/api/dto/ResponseAccessTokenViewDTO'
import { RefreshTokenEndpoint } from '../../../libs/swagger/auth/refreshTokenEndpoint'
import { LogoutEndpoint } from '../../../libs/swagger/auth/logoutEndpoint'
import { RegistrationEmailResendingEndpoint } from '../../../libs/swagger/auth/registrationEmailResendingEndpoint'
import { emailDto } from '../../auth/src/types/emailDto'
import { PasswordRecoveryEndpoint } from '../../../libs/swagger/auth/passwordRecoveryEndpoint'
import { JwtAuthGuard } from '../../../libs/guards/jwt-auth.guard'
import { EmailService } from '../../../libs/modules/email/email.service'
import { firstValueFrom } from 'rxjs'
import { AuthInputModel } from '../../auth/src/api/dto/AuthInputModel'
import { tokensDto } from '../../../libs/types/TokensDto'
import { Me } from '../../../libs/swagger/auth/me'
import Configuration from '../../../libs/config/configuration'
import { GoogleEndpoint } from '../../../libs/swagger/auth/googleEndpoint'
import { ValidatePasswordRecoveryCodeCommand } from '../../auth/src/application/use-cases/ValidPasswordRecoveryCode'
import { ClientProxy } from '@nestjs/microservices'
import { SwaggerGetRegistrationConfirmationEndpoint } from '../../../libs/swagger/Internal/swaggerGetNewPasswordEndpoint'
import { SwaggerPostRegistrationConfirmationEndpoint } from '../../../libs/swagger/Internal/swaggerPostNewPasswordEndpoint'
import { EmailResendingDto } from '../../auth/src/api/dto/EmailResendingDto'
import { ApiExcludeEndpoint } from '@nestjs/swagger'
import { Cookies } from '../../../libs/decorators/auth.decorator'
import { UserId } from '../../../libs/decorators/user.decorator'
import { SwaggerPostGoogleEndpoint } from '../../../libs/swagger/Internal/swaggerPostGoogleEndpoint'
import { GithubEndpoint } from '../../../libs/swagger/auth/githubEndpoint'

@Injectable()
@Controller('auth')
export class AuthController {
    constructor(
        private readonly commandBus: CommandBus,
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
        const result = await firstValueFrom<ResultObject<string>>(
            this.authServiceClient.send('logout', {
                refreshToken,
            })
        )
        if (result.data == null) mappingErrorStatus(result)

        res.clearCookie('refreshToken')
    }

    @Get('registration-confirmation')
    @ApiExcludeEndpoint()
    async getRegistrationConfirmation(
        @Query('code') code: string,
        @Res() res: Response
    ) {
        const result = await firstValueFrom<ResultObject<string>>(
            this.authServiceClient.send('registration-confirmation', { code })
        )
        if (result.data === 'ok') {
            return res.redirect(
                'https://incubatogram.org/auth/sign-up/congratulations'
            )
        } else {
            const emailParam = result.data
                ? `?email=${encodeURIComponent(result.data)}`
                : ''
            return res.redirect(
                `https://incubatogram.org/auth/sign-up/link-expired${emailParam}`
            )
        }
    }

    @Post('registration-email-resending')
    @RegistrationEmailResendingEndpoint()
    @HttpCode(204)
    async registrationEmailResending(@Body() { email }: EmailResendingDto) {
        const newUserConfirmationCode = await firstValueFrom<
            ResultObject<string>
        >(
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

    // 1 получаем от клиента код и смотрим его валидность
    @Get('new-password')
    @ApiExcludeEndpoint()
    @HttpCode(HttpStatus.NO_CONTENT)
    async getNewPasswordGetRequest(
        @Query('code') code: string,
        @Res() res: Response
    ) {
        // тут проверим валидный ли код
        const isValidPasswordRecoveryCode = await this.commandBus.execute(
            new ValidatePasswordRecoveryCodeCommand(code)
        )
        if (isValidPasswordRecoveryCode) {
            return res.status(HttpStatus.OK).send('Code is valid')
        } else {
            return res.status(HttpStatus.BAD_REQUEST).send('Invalid code')
        }
    }

    // 2-й если код валидный, клиент отправляет код и пароль
    @Post('new-password')
    @ApiExcludeEndpoint()
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
    @GithubEndpoint()
    async github(
        @Body() body: { code: string },
        @Headers('User-Agent') userAgent: string | 'unknow',
        @Ip() ip: string,
        @Res() res: Response
    ) {
        console.log('body.code = ', body.code)
        const accessToken = await this.githubService.validate(body.code)
        if (accessToken.data === null) return mappingErrorStatus(accessToken)
        console.log('accessToken = ', accessToken)
        const user = await this.githubService.getGithubUserByToken(accessToken)

        // та же логика что и на google

        console.log('user = ', user)

        const tokensInfoAndCurrentUser = await firstValueFrom<{
            tokensInfo: ResultObject<tokensDto>
            currentUser: any
        }>(
            this.authServiceClient.send('github', {
                user: user,
                userAgent,
                ip,
            })
        )
        const { tokensInfo, currentUser } = tokensInfoAndCurrentUser

        if (tokensInfoAndCurrentUser.tokensInfo.data === null)
            return mappingErrorStatus(tokensInfo)

        // res.cookie('refreshToken', tokensInfo.data.refreshToken, {
        //     httpOnly: true,
        //     secure: true,
        //     sameSite: 'none',
        // }).header('accessToken', tokensInfo.data.accessToken)
        // res.redirect(
        //     Configuration.getConfiguration().FRONT_URL +
        //         `auth/github-success?id=${currentUser.id}&userName=${currentUser.userName}&accessToken=${tokensInfo.data.accessToken}`
        // )
        // return { accessToken: tokensInfo.data.accessToken }

        console.log('tokensInfoAndCurrentUser = ', tokensInfoAndCurrentUser)

        res.cookie('refreshToken', tokensInfo.data.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        }).header('accessToken', tokensInfo.data.accessToken)

        // res.redirect(
        //     Configuration.getConfiguration().FRONT_URL +
        //     `auth/github-success?id=${currentUser.id}&userName=${currentUser.userName}&accessToken=${tokensInfo.data.accessToken}`
        // )

        // return new ResponseAccessTokenViewDTO({
        //     accessToken: tokensInfo.data.accessToken,
        // })
        return res.status(200).json({
            accessToken: tokensInfo.data.accessToken,
        })
    }

    @Get('google')
    @GoogleEndpoint()
    @UseGuards(AuthGuard('google'))
    async googleAuth() {}

    @Get('google-success')
    @ApiExcludeEndpoint()
    @UseGuards(AuthGuard('google'))
    async googleAuthCallback(
        @Req() req,
        @Res() res: Response,
        @Headers('User-Agent') userAgent: string | 'unknow',
        @Ip() ip: string
    ) {
        userAgent = userAgent ?? 'unknow'
        const tokensInfo = await firstValueFrom<ResultObject<tokensDto>>(
            this.authServiceClient.send('google-success', {
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
        })
        return res.redirect(
            Configuration.getConfiguration().FRONT_URL +
                `auth/google-success?id=${currentUser.id}&userName=${currentUser.userName}&accessToken=${tokensInfo.data.accessToken}`
        )
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
