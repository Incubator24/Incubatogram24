import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { AuthRepository } from '../../infrastructure/repositories/auth.repository'
import { HttpStatus } from '@nestjs/common'
import { IUserRepository } from '../../../../app/src/modules/user/infrastructure/interfaces/user.repository.interface'
import { ResultObject } from '../../../../../libs/helpers/types/helpersType'

export class ConfirmEmailCommand {
    constructor(public code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmail implements ICommandHandler<ConfirmEmailCommand> {
    constructor(
        public userRepository: IUserRepository,
        public authRepository: AuthRepository
    ) {}

    async execute(command: ConfirmEmailCommand): Promise<ResultObject<string>> {
        const foundUser = await this.authRepository.findUserByConfirmationCode(
            command.code
        )

        if (!foundUser) {
            return {
                data: null,
                resultCode: HttpStatus.BAD_REQUEST,
                message: 'couldn`t find user by code',
                field: 'code',
            }
        }
        // Проверка на истечение срока действия кода
        if (+foundUser.emailExpiration < new Date().getTime()) {
            console.log(+foundUser.emailExpiration + 'emailExpiration')
            console.log(new Date().getTime() + 'now time')
            return {
                data: foundUser.user.email,
                resultCode: HttpStatus.BAD_REQUEST,
                message: 'confirmation code is Expired',
                field: 'code',
            }
        }
        // Проверка, был ли код уже подтверждён
        if (foundUser.isConfirmed) {
            return {
                data: foundUser.user.email,
                resultCode: HttpStatus.BAD_REQUEST,
                message: 'confirmation code is already confirmed',
                field: 'code',
            }
        }
        // Обновляем подтверждение email
        const isUpdated = await this.authRepository.updateEmailConfirmation(
            foundUser.userId
        )
        console.log('isUpdated = ', isUpdated)
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
