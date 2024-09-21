import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserAndDeviceTypeFromRefreshToken } from '../../jwt.types'
import * as jwt from 'jsonwebtoken'
import { UserRepository } from '../../../../user/infrastructure/repositories/user.repository'
import { HttpStatus, Injectable } from '@nestjs/common'
import { ResultObject } from '../../../../../helpers/types/helpersType'
import Configuration from '../../../../../config/configuration'

@Injectable()
export class GetTokenInfoByRefreshTokenCommand {
    constructor(public token: string) {}
}

@CommandHandler(GetTokenInfoByRefreshTokenCommand)
export class GetTokenInfoByRefreshToken
    implements ICommandHandler<GetTokenInfoByRefreshTokenCommand>
{
    constructor(private usersQueryRepository: UserRepository) {}

    async execute(
        command: GetTokenInfoByRefreshTokenCommand
    ): Promise<ResultObject<UserAndDeviceTypeFromRefreshToken>> {
        let result
        try {
            result = jwt.verify(
                command.token,
                Configuration.getConfiguration().JWT_SECRET
            ) as {
                userId: string
                deviceId: string
                iat: number
                exp: number
            }
        } catch (e) {
            return {
                data: null,
                resultCode: HttpStatus.UNAUTHORIZED,
                message: 'something wrong with refresh token',
            }
        }

        const currentUser = await this.usersQueryRepository.findUserById(
            result.userId
        )
        if (!currentUser) {
            return {
                data: null,
                resultCode: HttpStatus.UNAUTHORIZED,
                message: 'couldn`t find user',
            }
        }

        // const isActualSession =
        //   await this.deviceQueryRepository.findSessionByDeviceIdAndUserId(
        //     result.deviceId,
        //     result.userId,
        //   );
        //
        // if (!isActualSession) {
        //   return {
        //     data: null,
        //     resultCode: ResultCode.Unauthorized,
        //     message: 'couldn`t session, please refresh your refreshToken',
        //   };
        // }
        return {
            data: result,
            resultCode: HttpStatus.NO_CONTENT,
        }
    }
}
