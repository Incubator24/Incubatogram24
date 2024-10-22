import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { v4 as uuidv4 } from 'uuid'
import { HttpStatus } from '@nestjs/common'
import { ResultObject } from '../../../../helpers/types/helpersType'
import { IUserRepository } from '../../../user/infrastructure/interfaces/user.repository.interface'
import { User } from '@prisma/client'
import { EmailExpirationDto } from '../../../../helpers/types/emailConfirmationType'
import { add } from 'date-fns'

export class ChangeUserConfirmationCodeCommand {
    constructor(public email: string) {}
}

@CommandHandler(ChangeUserConfirmationCodeCommand)
export class ChangeUserConfirmationCode
    implements ICommandHandler<ChangeUserConfirmationCodeCommand>
{
    constructor(public userRepository: IUserRepository) {}

    async execute(
        command: ChangeUserConfirmationCodeCommand
    ): Promise<ResultObject<string>> {
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
        // узнать подтвержден ли емеил !!!!!!!!!!!!!!!!!
        const foundEmailConfirmation =
            await this.userRepository.findEmailConfirmationByUserId(getUser.id)
        if (foundEmailConfirmation.isConfirmed) {
            return {
                data: null,
                resultCode: HttpStatus.BAD_REQUEST,
                field: 'email',
                message: 'user already confirmed',
            }
        }
        const newEmailConfirmationDto: EmailExpirationDto = {
            confirmationCode: uuidv4(),
            emailExpiration: add(new Date(), {
                hours: 2,
                minutes: 3,
            }),
        }

        try {
            await this.userRepository.updateEmailConfirmationCode(
                foundEmailConfirmation.id,
                newEmailConfirmationDto
            )
        } catch (e) {
            return {
                data: null,
                resultCode: HttpStatus.BAD_REQUEST,
                field: 'code',
                message: 'user some error on resending email' + e.message,
            }
        }
        // const updatedUserInfo =
        //     await this.userRepository.findFullInfoUserAndEmailInfo(
        //         command.email
        //     )
        // if (!updatedUserInfo) {
        //     return {
        //         data: null,
        //         resultCode: HttpStatus.BAD_REQUEST,
        //         field: 'code',
        //         message: 'user some error on resending email',
        //     }
        // }

        // if (updatedUserInfo.confirmationCode !== newConfirmationCode) {
        //     return {
        //         data: null,
        //         resultCode: HttpStatus.BAD_REQUEST,
        //         field: 'code',
        //         message: 'user some error on resending email',
        //     }
        // }
        return {
            data: newEmailConfirmationDto.confirmationCode,
            resultCode: HttpStatus.NO_CONTENT,
        }
    }
}
