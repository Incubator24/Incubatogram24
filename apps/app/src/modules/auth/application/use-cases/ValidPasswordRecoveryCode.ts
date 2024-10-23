import { Injectable } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { RecoveryCodesRepository } from '../../../email/infrastructure/repositories/recoveryCodes.repository'

@Injectable()
export class ValidatePasswordRecoveryCodeCommand {
    constructor(public code: string) {}
}

@CommandHandler(ValidatePasswordRecoveryCodeCommand)
export class ValidatePasswordRecoveryCode
    implements ICommandHandler<ValidatePasswordRecoveryCodeCommand>
{
    constructor(public recoveryCodesRepository: RecoveryCodesRepository) {}

    async execute(command: ValidatePasswordRecoveryCodeCommand): Promise<any> {
        const foundCode =
            await this.recoveryCodesRepository.findDataByRecoveryCode(
                command.code
            )
        if (!foundCode) return false
        if (foundCode.expirationAt < new Date()) return false
        return true
    }
}
