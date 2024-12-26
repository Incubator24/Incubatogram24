import { Strategy } from 'passport-local'
import { PassportStrategy } from '@nestjs/passport'
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { UserRepository } from '../../apps/app/src/modules/user/infrastructure/repositories/user.repository'
import { ClientProxy } from '@nestjs/microservices'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(
        public userRepository: UserRepository,
        private commandBus: CommandBus,
        @Inject('AUTH_SERVICE') private readonly authServiceClient: ClientProxy
    ) {
        super({
            usernameField: 'loginOrEmail',
        })
    }

    async validate(loginOrEmail: string, password: string): Promise<any> {
        console.log('loginOrEmail', loginOrEmail, password)
        const userId = await firstValueFrom(
            this.authServiceClient.send('check-credential', {
                loginOrEmail,
                password,
            })
        )
        console.log('userId = ', userId)
        if (!userId) {
            throw new UnauthorizedException()
        }
        const user = await this.userRepository.findUserById(userId)
        if (!user) throw new UnauthorizedException()
        return { userId: user!.id }
    }
}
