import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { v4 as uuidv4 } from 'uuid'
import { ResultObject } from '../../../../helpers/helpersType'
import { CreateJWTCommand } from '../../jwt/application/use-cases/CreateJWT'
import { CreateRefreshJWTCommand } from '../../jwt/application/use-cases/CreateRefreshJWT'
import { GetTokenInfoByRefreshTokenCommand } from '../../jwt/application/use-cases/GetTokenInfoByRefreshToken'
import { HttpStatus, Injectable } from '@nestjs/common'
import { DeviceDBModel } from '../../../devices/device.types'
import { AuthRepository } from '../../auth.repository'

@Injectable()
export class AddDeviceInfoToDBCommand {
    constructor(
        public userId: number,
        public userAgent: string,
        public ip: string,
        public deviceId?: string
    ) {}
}

@CommandHandler(AddDeviceInfoToDBCommand)
export class AddDeviceInfoToDB
    implements ICommandHandler<AddDeviceInfoToDBCommand>
{
    constructor(
        public authRepository: AuthRepository,
        private commandBus: CommandBus
    ) {}

    async execute(
        command: AddDeviceInfoToDBCommand
    ): Promise<ResultObject<any>> {
        console.log('AddDeviceInfoToDB is working')
        const accessToken = await this.commandBus.execute(
            new CreateJWTCommand(command.userId)
        )
        const currentDeviceId = command.deviceId ? command.deviceId : uuidv4()
        const refreshToken = await this.commandBus.execute(
            new CreateRefreshJWTCommand(command.userId, currentDeviceId)
        )

        const getInfoFromRefreshToken = await this.commandBus.execute(
            new GetTokenInfoByRefreshTokenCommand(refreshToken.refreshToken)
        )

        if (getInfoFromRefreshToken.data === null) {
            return {
                data: null,
                resultCode: HttpStatus.BAD_REQUEST,
                message: 'couldn`t get refreshToken',
            }
        }
        const result: DeviceDBModel = {
            userId: command.userId,
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
        return {
            data: {
                accessToken: accessToken.accessToken,
                refreshToken: refreshToken.refreshToken,
            },
            resultCode: HttpStatus.OK,
        }
    }
}
