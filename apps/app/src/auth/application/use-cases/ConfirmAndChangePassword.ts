import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { AuthService } from '../../auth.service'
import * as bcrypt from 'bcrypt'
import { RecoveryCodesRepository } from '../../../email/recoveryCodes.repository'
import { AuthRepository } from '../../auth.repository'
import { ResultObject } from '../../../../helpers/helpersType'
import { HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../../config/configuration'

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
        public recoveryCodesRepository: RecoveryCodesRepository,
        protected configService: ConfigService<ConfigType, true>
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

        const passwordSaltNumber = this.configService.get<number>(
            'PASSWORD_SALT',
            10
        )
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