import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../prisma/prisma.service'
import { EmailConfirmationUser, Prisma } from '@prisma/client'
import { add } from 'date-fns'
import { emailConfirmationType } from '../email/emailConfirmationType'
import { CreteProfileDto } from './dto/CreteProfileDto'
import { UserWithEmailViewModel } from '../../helpers/types'

@Injectable()
export class UserRepository {
    constructor(private prisma: PrismaService) {}

    async findUserById(userId: number): Promise<any | null> {
        const foundUser = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                Profile: true,
            },
        })
        if (!foundUser) {
            return null
        }

        const avatarId = foundUser.Profile?.avatarId || null

        return {
            id: foundUser.id,
            userName: foundUser.userName,
            name: foundUser.userName,
            email: foundUser.email,
            createdAt: foundUser.createdAt,
            avatarId: avatarId,
        }
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

    async updateAvatarId(userId: number, url: string) {
        const updateAvatarUrlForCurrentUser = await this.prisma.profile.update({
            where: {
                id: userId,
            },
            data: {
                avatarId: url,
            },
        })
        return updateAvatarUrlForCurrentUser
            ? updateAvatarUrlForCurrentUser.avatarId === url
            : false
    }

    async deleteAvatarId(userId: number) {
        const updateAvatarUrlForCurrentUser = await this.prisma.profile.update({
            where: {
                id: userId,
            },
            data: {
                avatarId: null,
            },
        })
        return updateAvatarUrlForCurrentUser
            ? updateAvatarUrlForCurrentUser.avatarId === null
            : false
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

    async findUserByLoginOrEmailWithEmailInfo(
        userName: string,
        email: string
    ): Promise<any> {
        return this.prisma.user.findFirst({
            where: {
                OR: [{ email: email }, { userName: userName }],
            },
            include: {
                emailConfirmationUser: {
                    select: {
                        id: true,
                        confirmationCode: true,
                        emailExpiration: true,
                        isConfirmed: true,
                    },
                },
            },
        })
    }

    async findFullInfoUserAndEmailInfoById(
        userId: string
    ): Promise<UserWithEmailViewModel | null> {
        const id = Number(userId)
        if (isNaN(id)) return null
        const fullInfo = await this.prisma.emailConfirmationUser.findFirst({
            select: {
                user: true,
                confirmationCode: true,
                emailExpiration: true,
                isConfirmed: true,
            },
            where: {
                user: { id: id },
            },
        })
        if (fullInfo && fullInfo.user) {
            return {
                id: fullInfo.user.id,
                login: fullInfo.user.userName,
                email: fullInfo.user.email,
                createdAt: fullInfo.user.createdAt,
                passwordSalt: fullInfo.user.passwordSalt,
                passwordHash: fullInfo.user.passwordHash,
                confirmationCode: fullInfo.confirmationCode,
                emailExpiration: fullInfo.emailExpiration,
                isConfirmed: fullInfo.isConfirmed,
            }
        }

        return null
    }

    async sendEmailConfirmation(
        emailConfirmationInfo: emailConfirmationType
    ): Promise<any | null> {
        const sentEmailConfirmation =
            await this.prisma.emailConfirmationUser.create({
                data: {
                    userId: emailConfirmationInfo.userId,
                    confirmationCode: emailConfirmationInfo.confirmationCode,
                    emailExpiration: emailConfirmationInfo.emailExpiration,
                    isConfirmed: emailConfirmationInfo.isConfirmed,
                },
            })

        if (sentEmailConfirmation) {
            return this.prisma.emailConfirmationUser.findFirst({
                where: {
                    id: sentEmailConfirmation.id,
                },
            })
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

    async updateProfile(
        createProfileDto: CreteProfileDto,
        userId: number
    ): Promise<boolean> {
        const dataToUpdate: any = {
            firstName: createProfileDto.firstName,
            lastName: createProfileDto.lastName,
        }
        if (createProfileDto.dateOfBirth) {
            dataToUpdate.dateOfBirth = new Date(createProfileDto.dateOfBirth)
        }

        if (createProfileDto.userName) {
            dataToUpdate.userName = createProfileDto.userName
        }

        if (createProfileDto.aboutMe) {
            dataToUpdate.aboutMe = createProfileDto.aboutMe
        }
        if (createProfileDto.city) {
            dataToUpdate.city = createProfileDto.city
        }
        const updateProfile = await this.prisma.user.updateMany({
            where: { id: userId },
            data: dataToUpdate,
        })

        return updateProfile.count > 0
    }

    async findUserByCode(code: string): Promise<EmailConfirmationUser | null> {
        const userEmailConfirmationData =
            await this.prisma.emailConfirmationUser.findFirst({
                where: {
                    confirmationCode: code,
                },
            })

        return userEmailConfirmationData.userId
            ? userEmailConfirmationData
            : null
    }

    async findUserIdByUserId(userId: string): Promise<string | number> {
        const id = Number(userId)
        if (isNaN(id)) return null
        const foundUserId = await this.prisma.user.findFirst({
            select: {
                id: true,
            },
            where: {
                id: id,
            },
        })

        return foundUserId ? foundUserId.id : null
    }

    async deleteUserByUserId(userId: number) {
        await this.prisma.emailConfirmationUser.deleteMany({
            where: { userId: userId },
        })
        await this.prisma.user.delete({
            where: { id: userId },
        })
    }

    // for testing RemoveAll
    async deleteAllEmailData() {
        await this.prisma.emailConfirmationUser.deleteMany({})
    }

    async deleteAllUsers() {
        await this.prisma.user.deleteMany({})
    }
}
