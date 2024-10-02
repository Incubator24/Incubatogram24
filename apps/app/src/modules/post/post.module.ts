import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { PostsController } from './api/post.controller'
import { IPostRepository } from './infrastructure/interfaces/post.repository.interface'
import { PostRepository } from './infrastructure/repositories/post.repository'
import { SavePostImage } from './application/use-cases/SaveImage'
import { PrismaService } from '../../../../../prisma/prisma.service'
import { S3StorageAdapter } from '../files/adapter/file-storage-adapter-service'

const repositories = [{ provide: IPostRepository, useClass: PostRepository }]
const useCases = [SavePostImage]

@Module({
    imports: [CqrsModule],
    controllers: [PostsController],
    providers: [
        PrismaService,
        S3StorageAdapter,
        PostRepository,
        ...repositories,
        ...useCases,
    ],
    exports: [...repositories, PostRepository],
})
export class PostModule {}
