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
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common'
import { CreateUserDto } from './dto/CreateUserDto'
import { Response } from 'express'
import {
    mappingBadRequest,
    mappingErrorStatus,
    ResultObject,
} from '../../helpers/helpersType'
import { CreateUserByRegistrationCommand } from './application/use-cases/CreateUserByRegistration'
import { AuthService } from './auth.service'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { AddDeviceInfoToDBCommand } from './application/use-cases/AddDeviceInfoToDB'
import { UserId } from './decorators/user.decorator'
import { LoginSuccessViewModel } from './types/LoginSuccessView'
import { ConfirmEmailCommand } from './application/use-cases/ConfirmEmail'
import { ChangeUserConfirmationCodeCommand } from './application/use-cases/ChangeUserConfirmationCode'
import { AddRecoveryCodeAndEmailCommand } from './application/use-cases/AddRecoveryCodeAndEmail'
import { ConfirmAndChangePasswordCommand } from './application/use-cases/ConfirmAndChangePassword'
import { Cookies } from './decorators/auth.decorator'
import { LogoutUserCommand } from './application/use-cases/LogoutUser'
import { EmailService } from '../email/email.service'
import { RefreshTokenByRefreshCommand } from './application/use-cases/RefreshTokenByRefresh'
import { emailDto } from './types/emailDto'

@Injectable()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly authService: AuthService,
        private readonly emailService: EmailService
    ) {}

    @Post('/registration')
    @ApiOperation({ summary: 'registration user' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'success registration  user',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'error on registration user',
    })
    @HttpCode(HttpStatus.CREATED)
    async registrationUser(@Body() createUserDto: CreateUserDto) {
        const newUser: ResultObject<string> = await this.commandBus.execute(
            new CreateUserByRegistrationCommand(createUserDto)
        )
        if (newUser.data === null) return mappingErrorStatus(newUser)
        return true
    }

    @Post('/login')
    @UseGuards(LocalAuthGuard)
    @ApiOperation({ summary: 'login user' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'success login  user',
        content: {
            'text/plain': {
                schema: {
                    example: {
                        accessToken: 'string',
                    },
                },
            },
        },
        type: LoginSuccessViewModel,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'incorrect values',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'login or password is incorrect',
    })
    @HttpCode(200)
    async loginUser(
        @Res({ passthrough: true }) res: Response,
        @Headers('User-Agent') userAgent: string | 'unknow',
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
        return { accessToken: tokensInfo.data.accessToken }
    }

    @Post('/refresh-token')
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
    @HttpCode(204)
    async logoutUser(
        @Res({ passthrough: true }) res: Response,
        @Cookies('refreshToken') refreshToken: string
    ) {
        //убрать лишнюю инфу в базе данных ( обнулить дату создания )
        const result = await this.commandBus.execute(
            new LogoutUserCommand(refreshToken)
        )
        if (result.data == null) mappingErrorStatus(result)
        // const currentUserInfo = await this.commandBus.execute(
        //   new GetTokenInfoByRefreshTokenCommand(refreshToken),
        // );
        // if (!currentUserInfo.data) return mappingErrorStatus(currentUserInfo);
        // const currentUserId: string = currentUserInfo.data.userId;
        // const currentDeviceId: string = currentUserInfo.data.deviceId;
        // await this.deviceRepository.updateIssuedDate(
        //   currentUserId,
        //   currentDeviceId,
        // );
        res.clearCookie('refreshToken')
    }

    @Post('/registration-confirmation')
    @HttpCode(204)
    async registrationConfirmation(@Query('code') code: string) {
        const result = await this.commandBus.execute(
            new ConfirmEmailCommand(code)
        )
        if (!result.data) return mappingErrorStatus(result)
        return true
    }

    @Post('/registration-email-resending')
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
    @HttpCode(204)
    async passwordRecovery(@Body() { email }: emailDto) {
        const recoveryCode = await this.commandBus.execute(
            new AddRecoveryCodeAndEmailCommand(email)
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

    @Post('/new-password')
    @HttpCode(204)
    async getNewPassword(
        @Query() { recoveryCode }: { recoveryCode: string },
        @Body() { newPassword }: { newPassword: string }
        // @Body() { newPassword, newRecoveryCode }: newPasswordWithRecoveryCodeDto
    ) {
        const result = await this.commandBus.execute(
            new ConfirmAndChangePasswordCommand(recoveryCode, newPassword)
        )
        if (result.data === null) return mappingErrorStatus(result)
        return true
    }

    @Get()
    getHello(): string {
        return this.authService.getHello()
    }
}
