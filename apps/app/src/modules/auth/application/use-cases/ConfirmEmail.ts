import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../../user/infrastructure/repositories/user.repository'
import { AuthRepository } from '../../infrastructure/repositories/auth.repository'
import { HttpStatus } from '@nestjs/common'
import { ResultObject } from '../../../../helpers/helpersType'

export class ConfirmEmailCommand {
    constructor(public code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmail implements ICommandHandler<ConfirmEmailCommand> {
    constructor(
        public userRepository: UserRepository,
        public authRepository: AuthRepository
    ) {}

    async execute(command: ConfirmEmailCommand): Promise<ResultObject<string>> {
        const foundUser = await this.userRepository.findUserByCode(command.code)
        if (!foundUser) {
            return {
                data: null,
                resultCode: HttpStatus.BAD_REQUEST,
                message: 'couldn`t find user by code',
                field: 'code',
            }
        }
        if (+foundUser.emailExpiration < new Date().getTime()) {
            console.log(+foundUser.emailExpiration + 'emailExpiration')
            console.log(new Date().getTime() + 'now time')
            return {
                data: null,
                resultCode: HttpStatus.BAD_REQUEST,
                message: 'confirmation code is Expired',
                field: 'code',
            }
        }
        if (foundUser.isConfirmed) {
            return {
                data: null,
                resultCode: HttpStatus.BAD_REQUEST,
                message: 'confirmation code is already confirmed',
                field: 'code',
            }
        }
        const isUpdated = await this.authRepository.updateEmailConfirmation(
            foundUser.userId
        )
        if (!isUpdated) {
            return {
                data: null,
                resultCode: HttpStatus.NOT_FOUND,
                message: 'couldn`t update confirmation code ',
                field: 'code',
            }
        }
        return {
            data: 'ok',
            resultCode: HttpStatus.NO_CONTENT,
        }
    }
}
