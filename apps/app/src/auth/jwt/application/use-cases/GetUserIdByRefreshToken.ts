import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import jwt from 'jsonwebtoken'
import { AuthRepository } from '../../../auth.repository.sql'
import { ResultObject } from '../../../../../helpers/helpersType'
import { HttpStatus } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../../../config/configuration'

export class GetUserIdByRefreshTokenCommand {
    constructor(public token: string) {}
}

@CommandHandler(GetUserIdByRefreshTokenCommand)
export class GetUserIdByRefreshToken
    implements ICommandHandler<GetUserIdByRefreshTokenCommand>
{
    constructor(
        public authRepository: AuthRepository,
        protected configService: ConfigService<ConfigType, true>
    ) {}

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
                this.configService.get<string>('JWT_SECRET', '123')
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
