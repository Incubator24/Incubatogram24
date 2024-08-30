import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../user.repository'
import { ResultObject } from '../../../../helpers/helpersType'
import { UserWithEmailViewModel } from '../../../../helpers/types'
import { HttpStatus } from '@nestjs/common'
import { isOlderThan13 } from '../../../../helpers/functions'
import { UpdateProfileDto } from '../../dto/UpdateProfileDto'

export class UpdateProfileCommand {
    constructor(
        public updateProfileDto: UpdateProfileDto,
        public userId: number
    ) {}
}

@CommandHandler(UpdateProfileCommand)
export class UpdateProfile implements ICommandHandler<UpdateProfileCommand> {
    constructor(private userRepository: UserRepository) {}

    async execute(
        command: UpdateProfileCommand
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
        if (isOlderThan13(command.updateProfileDto.dateOfBirth)) {
            return await this.userRepository.updateProfile(
                command.updateProfileDto,
                command.userId
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
