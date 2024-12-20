import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { AuthService } from '../auth.service'
import * as bcrypt from 'bcryptjs'
import { AuthRepository } from '../../infrastructure/repositories/auth.repository'
import { HttpStatus, Injectable } from '@nestjs/common'
import { IUserRepository } from '../../../../app/src/modules/user/infrastructure/interfaces/user.repository.interface'
import { RecoveryCodesRepository } from '../../../../../libs/modules/email/infrastructure/repositories/recoveryCodes.repository'
import { ResultObject } from '../../../../../libs/helpers/types/helpersType'
import Configuration from '../../../../../libs/config/configuration'
import { UpdatePasswordDto } from '../../../../../libs/helpers/types/passwordRecoveryDto'

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
        public userRepository: IUserRepository,
        public recoveryCodesRepository: RecoveryCodesRepository
    ) {}

    async execute(
        command: ConfirmAndChangePasswordCommand
    ): Promise<ResultObject<string>> {
        const foundEmailByRecoveryCode =
            await this.recoveryCodesRepository.findDataByRecoveryCode(
                command.recoveryCode
            )
        if (!foundEmailByRecoveryCode) {
            return {
                data: null,
                resultCode: HttpStatus.BAD_REQUEST,
                message: 'couldn`t find user be recovery code',
            }
        }
        console.log('foundEmailByRecoveryCode = ', foundEmailByRecoveryCode)
        const passwordSaltNumber =
            Configuration.getConfiguration().PASSWORD_SALT
        const passwordSalt = await bcrypt.genSalt(Number(passwordSaltNumber))
        const passwordHash = await this.authService._generateHash(
            command.password,
            passwordSalt
        )
        const updatePasswordDto: UpdatePasswordDto = {
            passwordSalt,
            passwordHash,
        }
        await this.userRepository.updatePassword(
            foundEmailByRecoveryCode.userId,
            updatePasswordDto
        )
        return {
            data: 'ok',
            resultCode: HttpStatus.NO_CONTENT,
        }
    }
}
