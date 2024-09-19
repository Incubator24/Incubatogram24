import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { AuthService } from '../auth.service'
import { Injectable } from '@nestjs/common'
import { IUserRepository } from '../../../user/infrastructure/interfaces/user.repository.interface'

@Injectable()
export class CheckCredentialCommand {
    constructor(
        public loginOrEmail: string,
        public password: string
    ) {}
}

@CommandHandler(CheckCredentialCommand)
export class CheckCredential
    implements ICommandHandler<CheckCredentialCommand>
{
    constructor(
        public userRepository: IUserRepository,
        public authService: AuthService
    ) {}

    async execute(command: CheckCredentialCommand) {
        const user = await this.userRepository.findUserByLoginOrEmail(
            command.loginOrEmail
        )
        if (!user) return false
        const passwordHash = await this.authService._generateHash(
            command.password,
            user.passwordSalt
        )
        if (user.passwordHash === passwordHash) {
            return user.id
        } else return false
    }
}
