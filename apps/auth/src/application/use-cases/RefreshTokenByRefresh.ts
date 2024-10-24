import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { AuthRepository } from '../../infrastructure/repositories/auth.repository'
import { UserAndDeviceTypeFromRefreshToken } from '../../jwt/jwt.types'
import { GetTokenInfoByRefreshTokenCommand } from '../../jwt/application/use-cases/GetTokenInfoByRefreshToken'
import { HttpStatus } from '@nestjs/common'
import { CreateJWTCommand } from '../../jwt/application/use-cases/CreateJWT'
import { CreateRefreshJWTCommand } from '../../jwt/application/use-cases/CreateRefreshJWT'
import { DeviceDBModel } from '../../../../app/src/modules/devices/device.types'
import { DeviceQueryRepositorySql } from '../../../../app/src/modules/devices/deviceQuery.repository.sql'
import {
    mappingErrorStatus,
    ResultObject,
} from '../../../../../libs/helpers/types/helpersType'

export class RefreshTokenByRefreshCommand {
    constructor(
        public refreshToken: string,
        public userAgent: string,
        public ip: string
    ) {}
}

@CommandHandler(RefreshTokenByRefreshCommand)
export class RefreshTokenByRefresh
    implements ICommandHandler<RefreshTokenByRefreshCommand>
{
    constructor(
        public authRepository: AuthRepository,
        public deviceQueryRepository: DeviceQueryRepositorySql,
        private commandBus: CommandBus
    ) {}

    async execute(
        command: RefreshTokenByRefreshCommand
    ): Promise<ResultObject<any>> {
        const isRefreshTokenInBlackList =
            await this.authRepository.findTokenInBlackList(command.refreshToken)
        if (isRefreshTokenInBlackList)
            return {
                data: null,
                resultCode: HttpStatus.UNAUTHORIZED,
                message: 'refreshToken used before',
            }
        const currentUserInfo: ResultObject<UserAndDeviceTypeFromRefreshToken> =
            await this.commandBus.execute(
                new GetTokenInfoByRefreshTokenCommand(command.refreshToken)
            )
        if (currentUserInfo.data === null) mappingErrorStatus(currentUserInfo)
        // return {
        //   data: null,
        //   resultCode: ResultCode.Unauthorized,
        //   message: 'couldn`t get refreshToken',
        // };
        const currentUserId: number = currentUserInfo.data!.userId
        const currentDeviceId: string = currentUserInfo.data!.deviceId

        let isActualSession
        try {
            isActualSession =
                await this.deviceQueryRepository.findSessionByDeviceIdAndUserId(
                    currentDeviceId,
                    currentUserId
                )
        } catch (e) {
            return {
                data: null,
                resultCode: HttpStatus.UNAUTHORIZED,
                message:
                    'couldn`t find ifo about, please refresh your refreshToken',
            }
        }

        if (!isActualSession) {
            return {
                data: null,
                resultCode: HttpStatus.UNAUTHORIZED,
                message: 'couldn`t session, please refresh your refreshToken',
            }
        }
        const accessToken = await this.commandBus.execute(
            new CreateJWTCommand(currentUserId)
        )
        const refreshToken = await this.commandBus.execute(
            new CreateRefreshJWTCommand(currentUserId, currentDeviceId)
        )

        const getInfoFromRefreshToken = await this.commandBus.execute(
            new GetTokenInfoByRefreshTokenCommand(refreshToken.refreshToken)
        )

        if (!getInfoFromRefreshToken.data) {
            return {
                data: null,
                resultCode: HttpStatus.BAD_REQUEST,
                message: 'couldn`t get refreshToken',
            }
        }
        const result: DeviceDBModel = {
            userId: currentUserId,
            issuedAt: getInfoFromRefreshToken.data.iat,
            expirationAt: getInfoFromRefreshToken.data.exp,
            deviceId: currentDeviceId,
            ip: command.ip,
            deviceName: command.userAgent,
        }
        const isCreated =
            await this.authRepository.createOrUpdateRefreshToken(result)
        if (!isCreated) {
            return {
                data: null,
                resultCode: HttpStatus.BAD_REQUEST,
                message: 'couldn`t get refreshToken',
            }
        }
        await this.authRepository.addTokenInBlackList(command.refreshToken)

        return {
            data: {
                accessToken: accessToken.accessToken,
                refreshToken: refreshToken.refreshToken,
            },
            resultCode: HttpStatus.OK,
        }
    }
}
