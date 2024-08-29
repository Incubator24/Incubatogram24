import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../user.repository'
import { CreteProfileDto } from '../../dto/CreteProfileDto'

export class UpdateProfileCommand {
    constructor(
        public createProfileDto: CreteProfileDto,
        public userId: number
    ) {}
}

@CommandHandler(UpdateProfileCommand)
export class UpdateProfile
    implements ICommandHandler<UpdateProfileCommand>
{
    constructor(private userRepository: UserRepository) {}

    async execute(command: UpdateProfileCommand): Promise<boolean> {
        return await this.userRepository.updateProfile(
            command.createProfileDto,
            command.userId
        )
    }
}
