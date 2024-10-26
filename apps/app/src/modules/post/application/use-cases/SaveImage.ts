import { Injectable } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { S3StorageAdapter } from '../../../files/adapter/file-storage-adapter-service'
import { IPostRepository } from '../../infrastructure/interfaces/post.repository.interface'

@Injectable()
export class SavePostImageCommand {
    constructor(
        public userId: number,
        public file: Express.Multer.File
    ) {}
}

@Injectable()
@CommandHandler(SavePostImageCommand)
export class SavePostImage implements ICommandHandler<SavePostImageCommand> {
    constructor(
        private fileStorage: S3StorageAdapter,
        private postRepository: IPostRepository
    ) {}

    async execute(command: SavePostImageCommand) {}
}
