import {
    Controller,
    Delete,
    Get,
    HttpCode,
    Injectable,
    Param,
    UnauthorizedException,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { DeleteOtherUserDeviceCommand } from './application/use-cases/DeleteOtherUserDevice'
import { DeleteUserDeviceByIdCommand } from './application/use-cases/DeleteUserDeviceById'
import { SkipThrottle } from '@nestjs/throttler'
import { DeviceQueryRepositorySql } from './deviceQuery.repository.sql'
import { GetUserIdByRefreshTokenCommand } from '../auth/jwt/application/use-cases/GetUserIdByRefreshToken'
import { GetTokenInfoByRefreshTokenCommand } from '../auth/jwt/application/use-cases/GetTokenInfoByRefreshToken'
import { Cookies } from '../auth/api/decorators/auth.decorator'
import { mappingErrorStatus } from '../../helpers/helpersType'
import { DeleteDeviceByIdEndpoint } from '../../swagger/devices/deleteDeviceByIdEndpoint'
import { DeleteDeviceEndpoint } from '../../swagger/devices/deleteDeviceEndpoint'
import { GetDeviceEndpoint } from '../../swagger/devices/getDeviceEndpoint'

@SkipThrottle()
@Injectable()
@Controller('security/devices')
export class DeviceController {
    constructor(
        public deviceQueryRepository: DeviceQueryRepositorySql,
        private commandBus: CommandBus
    ) {}

    @Get()
    @GetDeviceEndpoint()
    async getDevices(@Cookies('refreshToken') refreshToken: string) {
        const currentUserId = await this.commandBus.execute(
            new GetUserIdByRefreshTokenCommand(refreshToken)
        )
        if (currentUserId.data === null) mappingErrorStatus(currentUserId)

        return await this.deviceQueryRepository.getAllDeviceSessions(
            currentUserId.data
        )
    }

    @Delete()
    @DeleteDeviceEndpoint()
    @HttpCode(204)
    async deleteDevice(@Cookies('refreshToken') refreshToken: string) {
        const currentUserInfo = await this.commandBus.execute(
            new GetTokenInfoByRefreshTokenCommand(refreshToken)
        )
        if (currentUserInfo.data == null) mappingErrorStatus(currentUserInfo)

        const currentDeviceId = currentUserInfo.data.deviceId
        const currentUserId = currentUserInfo.data.userId

        const isDeleted: boolean = await this.commandBus.execute(
            new DeleteOtherUserDeviceCommand(currentUserId, currentDeviceId)
        )
        if (!isDeleted) {
            throw new UnauthorizedException()
        }
        return true
    }

    @Delete(':deviceId')
    @DeleteDeviceByIdEndpoint()
    @HttpCode(204)
    async deleteDeviceById(
        @Param('deviceId') deviceId: string,
        @Cookies('refreshToken') refreshToken: string
    ) {
        const currentUserInfo = await this.commandBus.execute(
            new GetTokenInfoByRefreshTokenCommand(refreshToken)
        )
        if (currentUserInfo.data === null)
            return mappingErrorStatus(currentUserInfo)

        const result = await this.commandBus.execute(
            new DeleteUserDeviceByIdCommand(currentUserInfo.data, deviceId)
        )

        if (result.data === null) mappingErrorStatus(result)

        return true
    }
}
