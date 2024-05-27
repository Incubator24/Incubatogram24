import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../prisma/prisma.service'
import { Prisma, User } from '@prisma/client'

@Injectable()
export class UserRepository {
    constructor(private prisma: PrismaService) {}

    async findUserById(userId: number): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        })
    }

    async createUser(newUser: Prisma.UserCreateInput): Promise<number | null> {
        const createdUser = await this.prisma.user.create({
            data: newUser,
        })
        if (createdUser.id) {
            return createdUser.id
        }
        return null
    }

    async deleteUser(id: number): Promise<boolean> {
        try {
            await this.prisma.user.delete({
                where: { id: id },
            })
            return true
        } catch (e) {
            return false
        }
    }

    async findUserByLoginOrEmail(loginOrEmail: string): Promise<any | null> {
        return this.prisma.user.findFirst({
            where: {
                OR: [{ email: loginOrEmail }, { login: loginOrEmail }],
            },
        })
    }
}
