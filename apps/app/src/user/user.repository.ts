import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../prisma/prisma.service'
import { EmailConfirmationUser, Prisma, User } from '@prisma/client'
import { add } from 'date-fns'

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

    async findUserByEmail(email: string): Promise<any | null> {
        return this.prisma.user.findFirst({
            where: {
                email: email,
            },
        })
    }

    async findUserByLoginOrEmail(loginOrEmail: string): Promise<any | null> {
        return this.prisma.user.findFirst({
            where: {
                OR: [{ email: loginOrEmail }, { userName: loginOrEmail }],
            },
        })
    }

    async findFullInfoUserAndEmailInfo(
        loginOrEmail: string
    ): Promise<any | null> {
        const fullInfo = await this.prisma.emailConfirmationUser.findFirst({
            select: {
                user: true,
                confirmationCode: true,
                emailExpiration: true,
                isConfirmed: true,
            },
            where: {
                user: {
                    OR: [{ userName: loginOrEmail }, { email: loginOrEmail }],
                },
            },
        })
        if (fullInfo && fullInfo.user) {
            return {
                id: fullInfo[0].user.id,
                login: fullInfo[0].user.login,
                email: fullInfo[0].user.email,
                createdAt: fullInfo[0].user.createdAt,
                passwordSalt: fullInfo[0].user.passwordSalt,
                passwordHash: fullInfo[0].user.passwordHash,
                confirmationCode: fullInfo[0].confirmationCode,
                emailExpiration: fullInfo[0].emailExpiration,
                isConfirmed: fullInfo[0].isConfirmed,
            }
        }

        return null
    }

    async updateConfirmationCode(
        userId: number,
        code: string
    ): Promise<boolean> {
        const emailConfirmation = add(new Date(), {
            hours: 2,
            minutes: 3,
        }).toISOString()

        const updatedConfirmationCode =
            await this.prisma.emailConfirmationUser.updateMany({
                where: { userId: userId },
                data: {
                    confirmationCode: code,
                    emailExpiration: emailConfirmation,
                },
            })

        return updatedConfirmationCode.count > 0
    }

    async findUserByCode(code: string): Promise<EmailConfirmationUser | null> {
        const userEmailConfirmationData =
            await this.prisma.emailConfirmationUser.findFirst({
                where: {
                    confirmationCode: code,
                },
            })

        return userEmailConfirmationData.userId
            ? userEmailConfirmationData[0]
            : null
    }
}
