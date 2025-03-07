import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { HttpStatus, Injectable } from '@nestjs/common'
import { UserRepository } from '../../infrastructure/repositories/user.repository'
import { S3StorageAdapter } from '../../../files/adapter/file-storage-adapter-service'
import { ResultObject } from '../../../../../../../libs/helpers/types/helpersType'

@Injectable()
export class SaveAvatarUseCaseCommand {
    constructor(
        public userId: number,
        public file: Express.Multer.File
    ) {}
}

@Injectable()
@CommandHandler(SaveAvatarUseCaseCommand)
export class SaveAvatar implements ICommandHandler<SaveAvatarUseCaseCommand> {
    constructor(
        private fileStorage: S3StorageAdapter,
        public userRepository: UserRepository
    ) {}

    async execute(
        command: SaveAvatarUseCaseCommand
    ): Promise<ResultObject<boolean>> {
        const result = await this.fileStorage.saveImage(
            command.userId,
            command.file.originalname,
            command.file.mimetype,
            command.file.buffer,
            'avatars'
        )
        console.log('result file = ', result)
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
        console.log(updateAvatarInfoForCurrentUser)
        if (!updateAvatarInfoForCurrentUser) {
            return {
                data: null,
                resultCode: HttpStatus.BAD_REQUEST,
                message:
                    'couldn`t save avatar for current user. Please, try again',
            }
        }

        return {
            data: updateAvatarInfoForCurrentUser,
            resultCode: HttpStatus.NO_CONTENT,
            message: 'saved avatar successfully',
        }
    }
}
