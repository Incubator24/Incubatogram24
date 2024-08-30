import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../user.repository'
import { CreateProfileDto } from '../../dto/CreateProfileDto'
import { UserWithEmailViewModel } from '../../../../helpers/types'
import { HttpStatus } from '@nestjs/common'
import { ResultObject } from '../../../../helpers/helpersType'
import { isOlderThan13 } from '../../../../helpers/functions'

export class CreateProfileCommand {
    constructor(
        public createProfileDto: CreateProfileDto,
        public userId: number
    ) {}
}

@CommandHandler(CreateProfileCommand)
export class CreateProfile implements ICommandHandler<CreateProfileCommand> {
    constructor(private userRepository: UserRepository) {}

    async execute(
        command: CreateProfileCommand
    ): Promise<ResultObject<number>> {
        const foundUserByToken: UserWithEmailViewModel | null =
            await this.userRepository.findFullInfoUserAndEmailInfoById(
                command.userId
            )
        if (!foundUserByToken.isConfirmed) {
            return {
                resultCode: HttpStatus.BAD_REQUEST,
                field: 'isConfirmEmail',
                message: 'email is not confirmed',
                data: null,
            }
        }
        if (isOlderThan13(command.createProfileDto.dateOfBirth)) {
            return await this.userRepository.createProfile(
                command.userId,
                command.createProfileDto
            )
        } else {
            return {
                resultCode: HttpStatus.BAD_REQUEST,
                field: 'dateOfBirth',
                message:
                    'A user under 13 cannot create a profile. Privacy Policy',
                data: null,
            }
        }
    }
}
