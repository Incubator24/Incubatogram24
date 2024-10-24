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
    NotFoundException,
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
import { ChangePasswordRecoveryCodeCommand } from '../application/use-cases/ChangePasswordRecoveryCode'
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
} from '../../../helpers/types/helpersType'
import Configuration from '../../../config/configuration'
import { Me } from '../../../swagger/auth/me'
import { AuthInputModel } from './dto/AuthInputModel'
import { SwaggerPostRegistrationConfirmationEndpoint } from '../../../swagger/Internal/swaggerPostRegistrationConfirmationEndpoint'
import { SwaggerGetRegistrationConfirmationEndpoint } from '../../../swagger/Internal/swaggerGetRegistrationConfirmationEndpoint'
import { SwaggerPostGoogleEndpoint } from '../../../swagger/Internal/swaggerPostGoogleEndpoint'
import { GoogleEndpoint } from '../../../swagger/auth/googleEndpoint'
import { GithubService } from '../application/githubService'
import { ValidatePasswordRecoveryCodeCommand } from '../application/use-cases/ValidPasswordRecoveryCode'

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
        console.log('userId = ', userId)
        userAgent = userAgent ?? 'unknow'
        const tokensInfo = await this.commandBus.execute(
            new AddDeviceInfoToDBCommand(userId, userAgent, ip)
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
            sameSite: 'none',
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

    @Get('/registration-confirmation')
    @SwaggerGetRegistrationConfirmationEndpoint()
    async getRegistrationConfirmation(
        @Query('code') code: string,
        @Res() res: Response
    ) {
        const result = await this.commandBus.execute(
            new ConfirmEmailCommand(code)
        )
        if (!result.data) return mappingErrorStatus(result)
        return res.redirect(
            'https://incubatogram.org/auth/sign-up/congratulations'
        )
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
            new ChangePasswordRecoveryCodeCommand(email, recaptchaValue)
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
    @Get('/new-password')
    @SwaggerGetRegistrationConfirmationEndpoint()
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
    @Post('/new-password')
    @SwaggerPostRegistrationConfirmationEndpoint()
    @HttpCode(204)
    async getNewPassword(
        @Query('code') code: string,
        @Body() { newPassword }: { newPassword: string }
    ) {
        const result = await this.commandBus.execute(
            new ConfirmAndChangePasswordCommand(code, newPassword)
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
        const user = await this.githubService.getGithubUserByToken(accessToken)
        console.log('user github = ', user)
        const userId: number = await this.authService.validateOAuthLogin(
            user,
            'github'
        )

        // та же логика что и на google

        const tokensInfo = await this.commandBus.execute(
            new AddDeviceInfoToDBCommand(userId, userAgent, ip)
        )
        if (tokensInfo.data === null) return mappingErrorStatus(tokensInfo)

        const currentUser = await this.userRepository.findUserById(userId)
        //

        res.cookie('refreshToken', tokensInfo.data.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        }).header('accessToken', tokensInfo.data.accessToken)
        res.redirect(
            Configuration.getConfiguration().FRONT_URL +
                `auth/github-success?id=${currentUser.id}&userName=${currentUser.userName}&accessToken=${tokensInfo.data.accessToken}`
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
            sameSite: 'none',
        }).header('accessToken', tokensInfo.data.accessToken)
        res.redirect(
            Configuration.getConfiguration().FRONT_URL +
                `auth/google-success?id=${currentUser.id}&userName=${currentUser.userName}&accessToken=${tokensInfo.data.accessToken}`
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
