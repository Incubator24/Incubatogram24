import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import { AuthRepository } from '../../infrastructure/repositories/auth.repository'
import { HttpStatus } from '@nestjs/common'
import { UserAndDeviceTypeFromRefreshToken } from '../../jwt/jwt.types'
import { GetTokenInfoByRefreshTokenCommand } from '../../jwt/application/use-cases/GetTokenInfoByRefreshToken'
import { DeviceRepository } from '../../../../app/src/modules/devices/device.repository'
import { DeviceQueryRepositorySql } from '../../../../app/src/modules/devices/deviceQuery.repository.sql'
import { ResultObject } from '../../../../../libs/helpers/types/helpersType'

export class LogoutUserCommand {
    constructor(public refreshToken: string) {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUser implements ICommandHandler<LogoutUserCommand> {
    constructor(
        public authRepository: AuthRepository,
        public deviceRepository: DeviceRepository,
        public deviceQueryRepository: DeviceQueryRepositorySql,
        private commandBus: CommandBus
    ) {}

    async execute(command: LogoutUserCommand): Promise<ResultObject<string>> {
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
        if (currentUserInfo.data === null)
            return {
                data: null,
                resultCode: HttpStatus.UNAUTHORIZED,
                message: 'couldn`t get refreshToken',
            }
        const currentUserId: number = currentUserInfo.data.userId
        const currentDeviceId: string = currentUserInfo.data.deviceId
        // const result = await this.deviceRepository.updateIssuedDate(
        //   currentUserId,
        //   currentDeviceId,
        // );
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
        const result = await this.deviceRepository.deleteCurrentUserDevice(
            currentUserId,
            currentDeviceId
        )
        if (!result) {
            return {
                data: null,
                resultCode: HttpStatus.UNAUTHORIZED,
                message: 'couldn`t delete device info',
            }
        }
        // await this.deviceRepository.deleteCurrentUserDevice(
        //   currentUserId,
        //   currentDeviceId,
        // );
        await this.authRepository.addTokenInBlackList(command.refreshToken)

        return {
            data: 'ok',
            resultCode: HttpStatus.OK,
        }
    }
}
