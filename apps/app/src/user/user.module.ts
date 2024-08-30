import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { UserController } from './application/user.controller'
import { UserQueryRepository } from './user.query.repository'
import { PrismaService } from '../../../../prisma/prisma.service'
import { GetUserIdByIdUseCase } from './application/use-cases/GetUserIdByUserId'
import { UserRepository } from './user.repository'
import { UpdateProfile } from './application/use-cases/UpdateProfile'
import { GetUserByIdFromToken } from './application/use-cases/GetUserByIdFromToken'
import { DeleteAvatar } from './application/use-cases/DeleteAvatar'
import { SaveAvatar } from './application/use-cases/SaveAvatar'
import { S3StorageAdapter } from '../files/adapter/file-storage-adapter-service'
import { UsersService } from './user.service'
import { CreateProfile } from './application/use-cases/CreateProfile'

const useCases = [
    GetUserIdByIdUseCase,
    CreateProfile,
    UpdateProfile,
    GetUserByIdFromToken,
    DeleteAvatar,
    SaveAvatar,
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
