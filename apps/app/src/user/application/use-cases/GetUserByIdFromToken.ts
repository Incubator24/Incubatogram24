import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../user.repository'
import { UserWithEmailViewModel } from '../../../../helpers/types'

export class GetUserByIdFromTokenCommand {
    constructor(public userId: string) {}
}

@CommandHandler(GetUserByIdFromTokenCommand)
export class GetUserByIdFromToken
    implements ICommandHandler<GetUserByIdFromTokenCommand>
{
    constructor(private userRepository: UserRepository) {}

    async execute(
        command: GetUserByIdFromTokenCommand
    ): Promise<UserWithEmailViewModel | null> {
        return await this.userRepository.findFullInfoUserAndEmailInfoById(
            command.userId
        )
    }
}
