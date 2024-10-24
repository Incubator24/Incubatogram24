import { Strategy } from 'passport-local'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { CheckCredentialCommand } from '../application/use-cases/CheckCredential'
import { UserRepository } from '../../../app/src/modules/user/infrastructure/repositories/user.repository'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(
        public userRepository: UserRepository,
        private commandBus: CommandBus
    ) {
        super({
            usernameField: 'loginOrEmail',
        })
    }

    async validate(loginOrEmail: string, password: string): Promise<any> {
        const userId = await this.commandBus.execute(
            new CheckCredentialCommand(loginOrEmail, password)
        )
        if (!userId) {
            throw new UnauthorizedException()
        }
        const user = await this.userRepository.findUserById(userId)
        if (!user) throw new UnauthorizedException()
        return { userId: user!.id }
    }
}
