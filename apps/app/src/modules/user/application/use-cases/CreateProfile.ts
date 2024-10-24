import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CreateProfileDto } from '../../api/dto/CreateProfileDto'
import { HttpStatus } from '@nestjs/common'
import { IUserRepository } from '../../infrastructure/interfaces/user.repository.interface'
import { isOlderThan13 } from '../../../../../../../libs/helpers/functions'

export class CreateProfileCommand {
    constructor(
        public createProfileDto: CreateProfileDto,
        public userId: number
    ) {}
}

@CommandHandler(CreateProfileCommand)
export class CreateProfile implements ICommandHandler<CreateProfileCommand> {
    constructor(private userRepository: IUserRepository) {}

    async execute(command: CreateProfileCommand): Promise<any> {
        const isConfirmEmail: boolean =
            await this.userRepository.isConfirmEmail(command.userId)
        console.log(isConfirmEmail)
        if (!isConfirmEmail) {
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
