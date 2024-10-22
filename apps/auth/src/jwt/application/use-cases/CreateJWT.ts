import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { LoginSuccessViewModel } from '../../jwt.types'
import * as jwt from 'jsonwebtoken'
import { Injectable } from '@nestjs/common'
import Configuration from '../../../../../config/configuration'

@Injectable()
export class CreateJWTCommand {
    constructor(public userId: number) {}
}

@CommandHandler(CreateJWTCommand)
export class CreateJWT implements ICommandHandler<CreateJWTCommand> {
    constructor() {}

    async execute(command: CreateJWTCommand): Promise<LoginSuccessViewModel> {
        const token = jwt.sign(
            { userId: command.userId },
            Configuration.getConfiguration().JWT_SECRET,
            {
                expiresIn: Configuration.getConfiguration().ACCESS_JWT_LIFETIME,
            }
        )
        return {
            accessToken: token,
        }
    }
}
