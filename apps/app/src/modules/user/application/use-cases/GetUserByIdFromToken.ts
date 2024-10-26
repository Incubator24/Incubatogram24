import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../infrastructure/repositories/user.repository'
import { UserWithEmailViewModel } from '../../../../../../../libs/helpers/types/types'

export class GetUserByIdFromTokenCommand {
    constructor(public userId: number) {}
}

@CommandHandler(GetUserByIdFromTokenCommand)
export class GetUserByIdFromToken
    implements ICommandHandler<GetUserByIdFromTokenCommand>
{
    constructor(private userRepository: UserRepository) {}

    async execute(
        command: GetUserByIdFromTokenCommand
    ): Promise<UserWithEmailViewModel | null | any> {
        // return await this.userRepository.findFullInfoUserAndEmailInfoById(
        //     command.userId
        // )
        return
    }
}
