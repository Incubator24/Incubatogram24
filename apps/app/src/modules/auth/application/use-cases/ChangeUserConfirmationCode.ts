import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { v4 as uuidv4 } from 'uuid'
import { UserRepository } from '../../../user/infrastructure/repositories/user.repository'
import { HttpStatus } from '@nestjs/common'
import { ResultObject } from '../../../../helpers/helpersType'

export class ChangeUserConfirmationCodeCommand {
    constructor(public email: string) {}
}

@CommandHandler(ChangeUserConfirmationCodeCommand)
export class ChangeUserConfirmationCode
    implements ICommandHandler<ChangeUserConfirmationCodeCommand>
{
    constructor(public userRepository: UserRepository) {}

    async execute(
        command: ChangeUserConfirmationCodeCommand
    ): Promise<ResultObject<string>> {
        const isExistUser = await this.userRepository.findUserByEmail(
            command.email
        )

        if (!isExistUser) {
            return {
                data: null,
                resultCode: HttpStatus.BAD_REQUEST,
                field: 'email',
                message: 'user doesn`t exist',
            }
        }
        const currentUserInfo =
            await this.userRepository.findFullInfoUserAndEmailInfo(
                command.email
            )

        if (currentUserInfo.isConfirmed) {
            return {
                data: null,
                resultCode: HttpStatus.BAD_REQUEST,
                field: 'email',
                message: 'user already confirmed',
            }
        }
        const newConfirmationCode = uuidv4()

        try {
            await this.userRepository.updateConfirmationCode(
                currentUserInfo.id,
                newConfirmationCode
            )
        } catch (e) {
            return {
                data: null,
                resultCode: HttpStatus.BAD_REQUEST,
                field: 'code',
                message: 'user some error on resending email' + e.message,
            }
        }
        const updatedUserInfo =
            await this.userRepository.findFullInfoUserAndEmailInfo(
                command.email
            )
        if (!updatedUserInfo) {
            return {
                data: null,
                resultCode: HttpStatus.BAD_REQUEST,
                field: 'code',
                message: 'user some error on resending email',
            }
        }

        if (updatedUserInfo.confirmationCode !== newConfirmationCode) {
            return {
                data: null,
                resultCode: HttpStatus.BAD_REQUEST,
                field: 'code',
                message: 'user some error on resending email',
            }
        }
        return {
            data: updatedUserInfo.confirmationCode,
            resultCode: HttpStatus.NO_CONTENT,
        }
    }
}
