import { HttpStatus, Injectable } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { S3StorageAdapter } from '../../../files/adapter/file-storage-adapter-service'
import { UserRepository } from '../../../user/user.repository'
import { ResultObject } from '../../../../helpers/helpersType'
import { PrismaService } from '../../../../../../prisma/prisma.service'

@Injectable()
export class SavePostImagesCommand {
    constructor(
        public userId: number,
        public description: string,
        public files: Express.Multer.File[]
    ) {}
}

@Injectable()
@CommandHandler(SavePostImagesCommand)
export class SavePostImages implements ICommandHandler<SavePostImagesCommand> {
    constructor(
        private fileStorage: S3StorageAdapter,
        public userRepository: UserRepository,
        private readonly prismaService: PrismaService
    ) {}

    async execute(
        command: SavePostImagesCommand
    ): Promise<ResultObject<boolean>> {
        const createdPost = await this.prismaService.$transaction(
            async (prismaTransaction) => {
                const createPost = await prismaTransaction.post.create({
                    data: {
                        description: command.description,
                        authorId: command.userId,
                    },
                })
                const uploadImagesForPost =
                    await this.fileStorage.savePostImages(
                        command.userId,
                        createPost.id,
                        command.files
                    )

                await Promise.all(
                    uploadImagesForPost.map(async (image) => {
                        await this.userRepository.createPostImage(
                            image.url,
                            createPost.id,
                            command.userId
                        )
                    })
                )
            }
        )

        return {
            data: true,
            resultCode: HttpStatus.CREATED,
            message: 'created post and image successfully',
        }
    }
}
