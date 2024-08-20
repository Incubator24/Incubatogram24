import { Module } from '@nestjs/common'
import { UserController } from './application/user.controller'
import { DeleteAvatarUseCase } from './application/use-cases/DeleteAvatarUseCase'
import { SaveAvatarUseCase } from './application/use-cases/SaveAvatarUseCase'
import { S3StorageAdapter } from '../files/adapter/file-storage-adapter-service'
import { UserRepository } from './user.repository'
import { PrismaService } from '../../../../prisma/prisma.service'
import { CqrsModule } from '@nestjs/cqrs'
import { UsersService } from './user.service'

const useCases = [DeleteAvatarUseCase, SaveAvatarUseCase]

@Module({
    imports: [CqrsModule],
    controllers: [UserController],
    providers: [
        UserRepository,
        ...useCases,
        UsersService,
        S3StorageAdapter,
        PrismaService,
    ],
})
export class UserModule {}
