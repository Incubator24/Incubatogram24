import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { UserController } from './application/user.controller'
import { UserQueryRepository } from './user.query.repository'
import { PrismaService } from '../../../../prisma/prisma.service'
import { GetUserIdByIdUseCase } from './application/use-cases/GetUserIdByUserId.useCase'
import { UserRepository } from './user.repository'
import { UpdateProfileUseCase } from './application/use-cases/UpdateProfile.useCase'
import { GetUserByIdFromTokenUseCase } from './application/use-cases/GetUserByIdFromTokenUseCase'

const useCases = [
    GetUserIdByIdUseCase,
    UpdateProfileUseCase,
    GetUserByIdFromTokenUseCase,
]

@Module({
    imports: [CqrsModule],
    controllers: [UserController],
    providers: [
        UserQueryRepository,
        UserRepository,
        PrismaService,
        ...useCases,
    ],
    exports: [UserQueryRepository, UserRepository, PrismaService],
})
export class UserModule {}
