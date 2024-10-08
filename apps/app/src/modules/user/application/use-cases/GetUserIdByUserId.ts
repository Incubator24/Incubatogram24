import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../infrastructure/repositories/user.repository'

export class GetUserIdByUserIdCommand {
    constructor(public userId: string) {}
}

@CommandHandler(GetUserIdByUserIdCommand)
export class GetUserIdByIdUseCase
    implements ICommandHandler<GetUserIdByUserIdCommand>
{
    constructor(private userRepository: UserRepository) {}

    async execute(command: GetUserIdByUserIdCommand): Promise<number | null> {
        return await this.userRepository.findUserIdByUserId(command.userId)
    }
}
