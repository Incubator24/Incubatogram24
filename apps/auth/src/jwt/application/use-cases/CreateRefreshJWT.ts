import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { LoginSuccessViewModelForRefresh } from '../../jwt.types'
import * as jwt from 'jsonwebtoken'
import { Injectable } from '@nestjs/common'
import Configuration from '../../../../../../libs/config/configuration'

@Injectable()
export class CreateRefreshJWTCommand {
    constructor(
        public userId: number,
        public deviceId: string
    ) {}
}

@CommandHandler(CreateRefreshJWTCommand)
export class CreateRefreshJWT
    implements ICommandHandler<CreateRefreshJWTCommand>
{
    constructor() {}

    async execute(
        command: CreateRefreshJWTCommand
    ): Promise<LoginSuccessViewModelForRefresh> {
        const token = jwt.sign(
            {
                userId: command.userId,
                deviceId: command.deviceId,
            },
            Configuration.getConfiguration().JWT_SECRET,
            {
                expiresIn:
                    Configuration.getConfiguration().REFRESH_JWT_LIFETIME,
            }
        )
        return {
            refreshToken: token,
        }
    }
}
