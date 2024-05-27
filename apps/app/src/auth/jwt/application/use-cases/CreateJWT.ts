import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { LoginSuccessViewModel } from '../../jwt.types'
import jwt from 'jsonwebtoken'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../../../config/configuration'

export class CreateJWTCommand {
    constructor(public userId: number) {}
}

@CommandHandler(CreateJWTCommand)
export class CreateJWT implements ICommandHandler<CreateJWTCommand> {
    constructor(protected configService: ConfigService<ConfigType, true>) {}

    async execute(command: CreateJWTCommand): Promise<LoginSuccessViewModel> {
        const token = jwt.sign(
            { userId: command.userId },
            this.configService.get<string>('JWT_SECRET', '123'),
            {
                expiresIn: this.configService.get<string>(
                    'ACCESS_JWT_LIFETIME',
                    '10h'
                ),
            }
        )
        return {
            accessToken: token,
        }
    }
}
