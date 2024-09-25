import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { HttpStatus, Injectable } from '@nestjs/common'
import { ResultObject } from '../../../../helpers/types/helpersType'
import { S3StorageAdapter } from '../../../files/adapter/file-storage-adapter-service'
import { IUserRepository } from '../../infrastructure/interfaces/user.repository.interface'

@Injectable()
export class DeleteAvatarUseCaseCommand {
    constructor(public userId: number) {}
}

@Injectable()
@CommandHandler(DeleteAvatarUseCaseCommand)
export class DeleteAvatar
    implements ICommandHandler<DeleteAvatarUseCaseCommand>
{
    constructor(
        private fileStorage: S3StorageAdapter,
        public userRepository: IUserRepository
    ) {}

    async execute(
        command: DeleteAvatarUseCaseCommand
    ): Promise<ResultObject<boolean>> {
        const foundUserProfile =
            await this.userRepository.foundProfileFromUserId(command.userId)
        if (foundUserProfile.avatarId === null) {
            return {
                data: false,
                resultCode: HttpStatus.BAD_REQUEST,
                message: 'Avatar doesn`t exist for current user.',
            }
        }
        const result = await this.fileStorage.deleteAvatar(command.userId)
        if (!result) {
            return {
                data: false,
                resultCode: HttpStatus.BAD_REQUEST,
                message:
                    'couldn`t delete avatar for current user. Please, try again',
            }
        }
        const isDeletedAvatarId = await this.userRepository.deleteAvatarId(
            command.userId
        )
        if (isDeletedAvatarId) {
            return {
                data: false,
                resultCode: HttpStatus.BAD_REQUEST,
                message:
                    'We are delete avatar from server, but couldn`t delete from database. ',
            }
        }

        return {
            data: true,
            resultCode: HttpStatus.NO_CONTENT,
            message: 'deleted avatar successfully',
        }
    }
}
