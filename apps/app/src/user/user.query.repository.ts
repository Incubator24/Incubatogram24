import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../prisma/prisma.service'

@Injectable()
export class UserQueryRepository {
    constructor(private prisma: PrismaService) {}

    async findUserById(userId: number): Promise<any | null> {
        const foundUser = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        })

        return {
            id: foundUser.id,
            userName: foundUser.userName,
            name: foundUser.name,
            email: foundUser.email,
            createdAt: foundUser.createdAt,
            avatarId: foundUser.avatarId,
        }
    }
}
