import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import jwt from 'jsonwebtoken'
import { AuthRepository } from '../../../infrastructure/repositories/auth.repository'
import { HttpStatus, Injectable } from '@nestjs/common'
import { ResultObject } from '../../../../../../libs/helpers/types/helpersType'
import Configuration from '../../../../../../libs/config/configuration'

@Injectable()
export class GetUserIdByRefreshTokenCommand {
    constructor(public token: string) {}
}

@CommandHandler(GetUserIdByRefreshTokenCommand)
export class GetUserIdByRefreshToken
    implements ICommandHandler<GetUserIdByRefreshTokenCommand>
{
    constructor(public authRepository: AuthRepository) {}

    async execute(
        command: GetUserIdByRefreshTokenCommand
    ): Promise<ResultObject<number>> {
        const isRefreshTokenInBlackList =
            await this.authRepository.findTokenInBlackList(command.token)
        if (isRefreshTokenInBlackList)
            return {
                data: null,
                resultCode: HttpStatus.UNAUTHORIZED,
                message: 'refreshToken used before',
            }

        let result
        try {
            result = jwt.verify(
                command.token,
                Configuration.getConfiguration().JWT_SECRET
            ) as {
                userId: string
            }
        } catch (error) {
            return {
                data: null,
                resultCode: HttpStatus.UNAUTHORIZED,
                field: 'refreshToken',
            }
        }
        return {
            data: result.userId,
            resultCode: HttpStatus.OK,
            field: 'refreshToken',
        }
    }
}
