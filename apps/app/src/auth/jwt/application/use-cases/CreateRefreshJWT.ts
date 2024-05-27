import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { LoginSuccessViewModelForRefresh } from '../../jwt.types'
import jwt from 'jsonwebtoken'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../../../config/configuration'

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
    constructor(protected configService: ConfigService<ConfigType, true>) {}

    async execute(
        command: CreateRefreshJWTCommand
    ): Promise<LoginSuccessViewModelForRefresh> {
        const token = jwt.sign(
            {
                userId: command.userId,
                deviceId: command.deviceId,
            },
            this.configService.get<string>('JWT_SECRET', '123'),
            {
                expiresIn: this.configService.get<string>(
                    'REFRESH_JWT_LIFETIME',
                    '10h'
                ),
            }
        )
        return {
            refreshToken: token,
        }
    }
}
