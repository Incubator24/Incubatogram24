import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { UserController } from './application/user.controller'
import { UserQueryRepository } from './user.query.repository'
import { PrismaService } from '../../../../prisma/prisma.service'
import { GetUserIdByIdUseCase } from './application/use-cases/GetUserIdByUserId.useCase'
import { UserRepository } from './user.repository'
import { UpdateProfileUseCase } from './application/use-cases/UpdateProfile.useCase'
import { GetUserByIdFromTokenUseCase } from './application/use-cases/GetUserByIdFromTokenUseCase'
import { DeleteAvatarUseCase } from './application/use-cases/DeleteAvatarUseCase'
import { SaveAvatarUseCase } from './application/use-cases/SaveAvatarUseCase'
import { S3StorageAdapter } from '../files/adapter/file-storage-adapter-service'
import { UsersService } from './user.service'

const useCases = [
    GetUserIdByIdUseCase,
    UpdateProfileUseCase,
    GetUserByIdFromTokenUseCase,
    DeleteAvatarUseCase,
    SaveAvatarUseCase,
]

@Module({
    imports: [CqrsModule],
    controllers: [UserController],
    providers: [
        UserQueryRepository,
        UserRepository,
        PrismaService,
        ...useCases,
        UsersService,
        S3StorageAdapter,
    ],
    exports: [UserQueryRepository, UserRepository, PrismaService],
})
export class UserModule {}
