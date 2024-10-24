import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { v4 as uuidv4 } from 'uuid'
import { HttpStatus, Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { add } from 'date-fns'
import { IUserRepository } from '../../../../app/src/modules/user/infrastructure/interfaces/user.repository.interface'
import {
    RecaptchaAdapter,
    ResultObject,
} from '../../../../../libs/helpers/types/helpersType'
import { PasswordRecoveryDto } from '../../../../../libs/helpers/types/passwordRecoveryDto'

@Injectable()
export class ChangePasswordRecoveryCodeCommand {
    constructor(
        public email: string,
        public recaptchaResponse: string
    ) {}
}

@CommandHandler(ChangePasswordRecoveryCodeCommand)
export class ChangePasswordRecoveryCode
    implements ICommandHandler<ChangePasswordRecoveryCodeCommand>
{
    constructor(
        public userRepository: IUserRepository,
        public recaptchaAdapter: RecaptchaAdapter // добавьте это поле
    ) {}

    async execute(
        command: ChangePasswordRecoveryCodeCommand
    ): Promise<ResultObject<string>> {
        const isValidRecaptcha = await this.recaptchaAdapter.isValid(
            command.recaptchaResponse
        )
        if (!isValidRecaptcha) {
            return {
                data: null,
                resultCode: HttpStatus.BAD_REQUEST,
                message: 'Invalid reCAPTCHA response',
            }
        }
        const getUser: User = await this.userRepository.findUserByEmail(
            command.email
        )
        if (!getUser) {
            return {
                data: null,
                resultCode: HttpStatus.BAD_REQUEST,
                field: 'email',
                message: 'user doesn`t exist',
            }
        }
        const updatePasswordRecoveryCode: PasswordRecoveryDto = {
            recoveryCode: uuidv4(),
            expirationAt: add(new Date(), {
                hours: 2,
                minutes: 3,
            }),
        }
        const updatedPasswordRecoveryCode =
            await this.userRepository.updatePasswordRecoveryCode(
                getUser.id,
                updatePasswordRecoveryCode
            )
        return {
            data: updatedPasswordRecoveryCode.recoveryCode,
            resultCode: HttpStatus.NO_CONTENT,
        }
    }
}
