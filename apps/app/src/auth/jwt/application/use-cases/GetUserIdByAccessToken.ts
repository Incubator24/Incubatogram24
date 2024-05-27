import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import jwt from 'jsonwebtoken'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../../../config/configuration'

export class GetUserIdByAccessTokenCommand {
    constructor(public token: string | null) {}
}

@CommandHandler(GetUserIdByAccessTokenCommand)
export class GetUserIdByAccessToken
    implements ICommandHandler<GetUserIdByAccessTokenCommand>
{
    constructor(protected configService: ConfigService<ConfigType, true>) {}

    async execute(
        command: GetUserIdByAccessTokenCommand
    ): Promise<string | null> {
        if (!command.token) return null
        let result
        try {
            result = jwt.verify(
                command.token,
                this.configService.get<string>('JWT_SECRET', '123')
            ) as {
                userId: string
                iat: number
                exp: number
            }

            const isExpired = result.exp < new Date().getTime() / 1000
            if (isExpired) {
                return null
            }
        } catch (e) {
            return null
        }

        return result.userId
    }
}
