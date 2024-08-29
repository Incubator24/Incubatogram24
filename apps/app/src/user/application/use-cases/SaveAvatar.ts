import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { HttpStatus, Injectable } from '@nestjs/common'
import { S3StorageAdapter } from '../../../files/adapter/file-storage-adapter-service'
import { UserRepository } from '../../user.repository'
import { ResultObject } from '../../../../helpers/helpersType'

@Injectable()
export class SaveAvatarUseCaseCommand {
    constructor(
        public userId: number,
        public file: Express.Multer.File
    ) {}
}

@Injectable()
@CommandHandler(SaveAvatarUseCaseCommand)
export class SaveAvatar
    implements ICommandHandler<SaveAvatarUseCaseCommand>
{
    constructor(
        private fileStorage: S3StorageAdapter,
        public userRepository: UserRepository
    ) {}

    async execute(
        command: SaveAvatarUseCaseCommand
    ): Promise<ResultObject<boolean>> {
        const result = await this.fileStorage.saveAvatar(
            command.userId,
            command.file.originalname,
            command.file.mimetype,
            command.file.buffer
        )
        if (!result) {
            return {
                data: null,
                resultCode: HttpStatus.BAD_REQUEST,
                message:
                    'couldn`t save avatar for current user. Please, try again',
            }
        }

        const updateAvatarInfoForCurrentUser =
            await this.userRepository.updateAvatarId(command.userId, result.url)

        return {
            data: updateAvatarInfoForCurrentUser,
            resultCode: HttpStatus.NO_CONTENT,
            message: 'saved avatar successfully',
        }
    }
}
