import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { UserController } from './application/user.controller'
import { UserQueryRepository } from './infrastructure/repositories/user.query.repository'
import { GetUserIdByIdUseCase } from './application/use-cases/GetUserIdByUserId'
import { UserRepository } from './infrastructure/repositories/user.repository'
import { UpdateProfile } from './application/use-cases/UpdateProfile'
import { GetUserByIdFromToken } from './application/use-cases/GetUserByIdFromToken'
import { DeleteAvatar } from './application/use-cases/DeleteAvatar'
import { SaveAvatar } from './application/use-cases/SaveAvatar'
import { UsersService } from './application/user.service'
import { CreateProfile } from './application/use-cases/CreateProfile'
import { RemoveUserById } from './application/use-cases/RemoveUserById'
import { PrismaService } from '../../../../../prisma/prisma.service'
import { S3StorageAdapter } from '../files/adapter/file-storage-adapter-service'
import { IUserRepository } from './infrastructure/interfaces/user.repository.interface'

const useCases = [
    GetUserIdByIdUseCase,
    CreateProfile,
    UpdateProfile,
    GetUserByIdFromToken,
    DeleteAvatar,
    SaveAvatar,
    RemoveUserById,
]

const repositories = [{ provide: IUserRepository, useClass: UserRepository }]

@Module({
    imports: [CqrsModule],
    controllers: [UserController],
    providers: [
        IUserRepository,
        UserQueryRepository,
        UserRepository,
        PrismaService,
        UsersService,
        S3StorageAdapter,
        ...useCases,
        ...repositories,
    ],
    exports: [UserQueryRepository, PrismaService, ...repositories],
})
export class UserModule {}
