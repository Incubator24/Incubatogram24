import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { v4 as uuidv4 } from 'uuid'
import { RecoveryCodesRepository } from '../../../email/recoveryCodes.repository'
import { UserRepository } from '../../../user/user.repository'
import { RecaptchaAdapter, ResultObject } from '../../../../helpers/helpersType'
import { HttpStatus, Injectable } from '@nestjs/common'

@Injectable()
export class AddRecoveryCodeAndEmailCommand {
    constructor(
        public email: string,
        public recaptchaResponse: string
    ) {}
}

@CommandHandler(AddRecoveryCodeAndEmailCommand)
export class AddRecoveryCodeAndEmail
    implements ICommandHandler<AddRecoveryCodeAndEmailCommand>
{
    constructor(
        public userRepository: UserRepository,
        public recoveryCodesRepository: RecoveryCodesRepository,
        public recaptchaAdapter: RecaptchaAdapter // добавьте это поле
    ) {}

    async execute(
        command: AddRecoveryCodeAndEmailCommand
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

        const recoveryCode = uuidv4()
        const foundUserByEmail = await this.userRepository.findUserByEmail(
            command.email
        )
        if (!foundUserByEmail) {
            return {
                data: null,
                resultCode: HttpStatus.NOT_FOUND,
                message: 'couldn`t find user',
            }
        }
        const isExistRecoveryCodeForCurrentEmail =
            await this.recoveryCodesRepository.findDataByRecoveryCode(
                recoveryCode
            )
        // await this.recoveryCodeModel.findOne({
        //   email: command.email,
        // });

        let result
        if (isExistRecoveryCodeForCurrentEmail) {
            result =
                await this.recoveryCodesRepository.updateDataForRecoveryCode(
                    command.email,
                    recoveryCode
                )
        } else {
            result =
                await this.recoveryCodesRepository.createDataForRecoveryCode(
                    command.email,
                    recoveryCode
                )
        }
        return result
            ? {
                  data: recoveryCode,
                  resultCode: HttpStatus.NOT_FOUND,
                  message: 'couldn`t find user',
              }
            : {
                  data: null,
                  resultCode: HttpStatus.BAD_REQUEST,
                  message: 'couldn`t send recovery code',
              }
    }
}
