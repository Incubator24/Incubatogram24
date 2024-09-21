import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../../../../prisma/prisma.service'

@Injectable()
export class UserQueryRepository {
    constructor(private prisma: PrismaService) {}

    // async findUserById(userId: number): Promise<any | null> {
    //     const foundUser = await this.prisma.user.findUnique({
    //         where: {
    //             id: userId,
    //         },
    //         include: {
    //             Profile: true,
    //             EmailExpiration: true,
    //         },
    //     })
    //     if (!foundUser) {
    //         return null
    //     }
    //     const avatarId = foundUser.Profile?.avatarId || null
    //     const profile = foundUser.Profile ? foundUser.Profile : null
    //     const isConfirmEmail =
    //         foundUser.EmailExpiration.length > 0
    //             ? foundUser.EmailExpiration[0].isConfirmed
    //             : null
    //
    //     return {
    //         id: foundUser.id,
    //         userName: foundUser.userName,
    //         name: foundUser.userName,
    //         email: foundUser.email,
    //         createdAt: foundUser.createdAt,
    //         avatarId: avatarId,
    //         isConfirmEmail: isConfirmEmail,
    //         profile: profile,
    //     }
    // }

    async findUserById(userId: number) {
        return this.prisma.user.findFirst({
            where: { id: userId },
            select: {
                id: true,
                userName: true,
                email: true,
                createdAt: true,
            },
        })
    }

    // for test
    async getAllUsers() {
        return this.prisma.user.findMany({
            include: {
                Profile: true,
                EmailExpiration: true,
            },
        })
    }
}
