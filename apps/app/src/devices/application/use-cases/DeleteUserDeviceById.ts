import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { DeviceQueryRepositorySql } from '../../deviceQuery.repository.sql'
import { DeviceRepositorySql } from '../../device.repository.sql'
import { ResultObject } from '../../../../helpers/helpersType'
import { HttpStatus } from '@nestjs/common'
import { UserAndDeviceTypeFromRefreshToken } from '../../../auth/jwt/jwt.types'

export class DeleteUserDeviceByIdCommand {
    constructor(
        public currentUserInfo: UserAndDeviceTypeFromRefreshToken,
        public currentDeviceId: string
    ) {}
}

@CommandHandler(DeleteUserDeviceByIdCommand)
export class DeleteUserDeviceById
    implements ICommandHandler<DeleteUserDeviceByIdCommand>
{
    constructor(
        public deviceRepository: DeviceRepositorySql,
        public deviceQueryRepository: DeviceQueryRepositorySql
    ) {}

    async execute(
        command: DeleteUserDeviceByIdCommand
    ): Promise<ResultObject<boolean>> {
        const findUserIdByDeviceId =
            await this.deviceQueryRepository.findUserIdByDeviceId(
                command.currentDeviceId
            )
        if (!findUserIdByDeviceId) {
            return {
                data: null,
                resultCode: HttpStatus.NOT_FOUND,
                message: 'user not found',
                field: 'refreshToken',
            }
        }

        // if (command.currentDeviceId === command.currentUserInfo.deviceId) {
        //   return {
        //     data: null,
        //     resultCode: ResultCode.BadRequest,
        //     message: 'cant delete current device',
        //   };
        // }
        if (findUserIdByDeviceId !== command.currentUserInfo.userId) {
            return {
                data: null,
                resultCode: HttpStatus.FORBIDDEN,
                message: 'cant delete another device id',
            }
        }

        const isDeleted: boolean =
            await this.deviceRepository.deleteUserDeviceById(
                command.currentDeviceId
            )
        if (isDeleted) {
            return {
                data: true,
                resultCode: HttpStatus.OK,
                message: '',
            }
        }

        return {
            data: null,
            resultCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'server error',
        }
    }
}
