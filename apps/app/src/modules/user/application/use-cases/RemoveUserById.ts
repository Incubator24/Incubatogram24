import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../infrastructure/repositories/user.repository'

export class RemoveUserByIdCommand {
    constructor(public userId: string) {}
}

@CommandHandler(RemoveUserByIdCommand)
export class RemoveUserById implements ICommandHandler<RemoveUserByIdCommand> {
    constructor(private userRepository: UserRepository) {}

    async execute(command: RemoveUserByIdCommand) {
        return await this.userRepository.deleteUserByUserId(
            Number(command.userId)
        )
    }
}
