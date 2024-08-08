import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { AuthService } from '../../auth.service'
import * as bcrypt from 'bcryptjs'
import { RecoveryCodesRepository } from '../../../email/recoveryCodes.repository'
import { AuthRepository } from '../../auth.repository'
import { ResultObject } from '../../../../helpers/helpersType'
import { HttpStatus, Injectable } from '@nestjs/common'
import Configuration from '../../../config/configuration'

@Injectable()
export class ConfirmAndChangePasswordCommand {
    constructor(
        public recoveryCode: string,
        public password: string
    ) {}
}

@CommandHandler(ConfirmAndChangePasswordCommand)
export class ConfirmAndChangePassword
    implements ICommandHandler<ConfirmAndChangePasswordCommand>
{
    constructor(
        public authService: AuthService,
        public authRepository: AuthRepository,
        public recoveryCodesRepository: RecoveryCodesRepository
    ) {}

    async execute(
        command: ConfirmAndChangePasswordCommand
    ): Promise<ResultObject<string>> {
        const foundEmailByRecoveryCode =
            await this.recoveryCodesRepository.findDataByRecoveryCode(
                command.recoveryCode
            )
        //  await this.authRepository.findEmailByRecoveryCode(command.recoveryCode);
        if (!foundEmailByRecoveryCode) {
            return {
                data: null,
                resultCode: HttpStatus.BAD_REQUEST,
                message: 'couldn`t find user be recovery code',
            }
        }

        const passwordSaltNumber =
            Configuration.getConfiguration().PASSWORD_SALT
        const passwordSalt = await bcrypt.genSalt(Number(passwordSaltNumber))
        const passwordHash = await this.authService._generateHash(
            command.password,
            passwordSalt
        )
        await this.authRepository.updateUserPassword(
            foundEmailByRecoveryCode.email,
            passwordHash,
            passwordSalt
        )
        return {
            data: 'ok',
            resultCode: HttpStatus.NO_CONTENT,
        }
    }
}
