import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { HttpStatus } from '@nestjs/common'
import { UpdateProfileDto } from '../../api/dto/UpdateProfileDto'
import { IUserRepository } from '../../infrastructure/interfaces/user.repository.interface'
import { isOlderThan13 } from '../../../../../../../libs/helpers/functions'

export class UpdateProfileCommand {
    constructor(
        public updateProfileDto: UpdateProfileDto,
        public userId: number
    ) {}
}

@CommandHandler(UpdateProfileCommand)
export class UpdateProfile implements ICommandHandler<UpdateProfileCommand> {
    constructor(private userRepository: IUserRepository) {}

    async execute(command: UpdateProfileCommand): Promise<any> {
        const isConfirmEmail: boolean =
            await this.userRepository.isConfirmEmail(command.userId)
        if (!isConfirmEmail) {
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
        return
    }
}
