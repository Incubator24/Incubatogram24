import { Injectable } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../../../app/src/modules/user/infrastructure/repositories/user.repository'

@Injectable()
export class AddDefaultProfileCommand {
    constructor(public userId: number) {}
}

@CommandHandler(AddDefaultProfileCommand)
export class AddDefaultProfile
    implements ICommandHandler<AddDefaultProfileCommand>
{
    constructor(public userRepository: UserRepository) {}

    async execute(command: AddDefaultProfileCommand) {
        const createdProfile = {
            userName: null,
            firstName: null,
            lastName: null,
            dateOfBirth: null,
            city: null,
            aboutMe: null,
        }
        await this.userRepository.createProfile(command.userId, createdProfile)
    }
}
